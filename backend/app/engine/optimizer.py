"""
FlowOpt Production Recovery Optimizer.
Powered by Google OR-Tools CP-SAT Solver with heuristic fallback.
Generates an optimal or near-optimal recovery schedule following disruptions,
respecting machine compatibility, breakdown windows, release delays, and dependencies.
"""
import time
from typing import List, Dict, Optional, Tuple, Any
from ortools.sat.python import cp_model

from backend.app.models.schemas import (
    Machine, MachineStatus, Job, ScheduleAssignment, JobStatus,
    RecoveryRequest, MachineBreakdown, MaterialDelay
)
from backend.app.engine.scheduler import validate_schedule_constraints


def run_recovery_optimization(
    machines: List[Machine],
    jobs: List[Job],
    current_schedule: List[ScheduleAssignment],
    current_time: float,
    breakdown: Optional[MachineBreakdown] = None,
    material_delay: Optional[MaterialDelay] = None,
    recovery_req: Optional[RecoveryRequest] = None
) -> Tuple[List[ScheduleAssignment], Dict[str, Any]]:
    """
    Solves the production recovery problem using Google OR-Tools CP-SAT.
    Minimizes total weighted tardiness, makespan, and excessive rerouting.
    Preserves completed work, reroutes eligible jobs around broken machines,
    and returns a guaranteed physical schedule.
    """
    if recovery_req is None:
        recovery_req = RecoveryRequest()

    start_perf_time = time.perf_counter()

    # Time scaling factor: 100 ticks per hour (0.01 hr precision)
    SCALE = 100
    MAX_HORIZON_HOURS = 200.0
    MAX_HORIZON = int(MAX_HORIZON_HOURS * SCALE)

    job_map: Dict[str, Job] = {j.id: j for j in jobs}
    machine_ids = [m.id for m in machines]
    original_assignment_map = {a.job_id: a for a in current_schedule}

    # Identify jobs completed before current_time
    completed_jobs: Dict[str, ScheduleAssignment] = {}
    uncompleted_jobs: List[Job] = []

    for a in current_schedule:
        # A job is completed if it ended before current_time and was not interrupted
        if a.end_time <= current_time:
            completed_jobs[a.job_id] = a
        else:
            uncompleted_jobs.append(job_map[a.job_id])

    # Build CP-SAT Model
    model = cp_model.CpModel()

    # Machine interval containers
    machine_intervals: Dict[str, List[Any]] = {m_id: [] for m_id in machine_ids}

    # Add frozen completed job intervals
    for c_job_id, c_assign in completed_jobs.items():
        c_start = int(round(c_assign.start_time * SCALE))
        c_dur = int(round(c_assign.duration * SCALE))
        c_end = c_start + c_dur
        c_interval = model.NewFixedSizeIntervalVar(c_start, c_dur, f"frozen_{c_job_id}")
        machine_intervals[c_assign.machine_id].append(c_interval)

    # Add breakdown downtime window as an unavailable interval on broken machine
    if breakdown:
        bd_m = breakdown.machine_id
        if bd_m in machine_intervals:
            bd_start = int(round(breakdown.start_time * SCALE))
            bd_dur = int(round(breakdown.duration_hours * SCALE))
            bd_interval = model.NewFixedSizeIntervalVar(
                bd_start, bd_dur, f"breakdown_{bd_m}"
            )
            machine_intervals[bd_m].append(bd_interval)

    # Decision variables for uncompleted jobs
    job_start_vars: Dict[str, Any] = {}
    job_end_vars: Dict[str, Any] = {}
    job_machine_bools: Dict[str, Dict[str, Any]] = {}
    job_assigned_machine: Dict[str, Any] = {}

    cur_time_scaled = int(round(current_time * SCALE))

    for job in uncompleted_jobs:
        dur_scaled = int(round(job.duration_hours * SCALE))
        release_scaled = int(round(job.release_time * SCALE))
        min_start = max(cur_time_scaled, release_scaled)

        start_var = model.NewIntVar(min_start, MAX_HORIZON, f"start_{job.id}")
        end_var = model.NewIntVar(min_start + dur_scaled, MAX_HORIZON, f"end_{job.id}")
        model.Add(end_var == start_var + dur_scaled)

        job_start_vars[job.id] = start_var
        job_end_vars[job.id] = end_var

        # Machine selection variables
        bool_vars: Dict[str, Any] = {}
        valid_machines = [m for m in job.compatible_machines if m in machine_ids]
        if not valid_machines:
            valid_machines = [job.preferred_machine]

        for m_id in valid_machines:
            b_var = model.NewBoolVar(f"assign_{job.id}_{m_id}")
            bool_vars[m_id] = b_var

            # Create optional interval for machine m_id
            opt_interval = model.NewOptionalIntervalVar(
                start_var, dur_scaled, end_var, b_var, f"opt_{job.id}_{m_id}"
            )
            machine_intervals[m_id].append(opt_interval)

        # Must be assigned to exactly one compatible machine
        model.AddExactlyOne(list(bool_vars.values()))
        job_machine_bools[job.id] = bool_vars

    # Enforce non-overlapping intervals on each machine
    for m_id, intervals in machine_intervals.items():
        if intervals:
            model.AddNoOverlap(intervals)

    # Enforce Precedence Constraints
    for job in uncompleted_jobs:
        if job.predecessor_id:
            pred_id = job.predecessor_id
            if pred_id in completed_jobs:
                pred_end_scaled = int(round(completed_jobs[pred_id].end_time * SCALE))
                model.Add(job_start_vars[job.id] >= pred_end_scaled)
            elif pred_id in job_end_vars:
                model.Add(job_start_vars[job.id] >= job_end_vars[pred_id])

    # Objective Function:
    # Minimize weighted tardiness + makespan + reassignment stability penalty
    tardiness_vars: List[Any] = []
    tardiness_coeffs: List[int] = []

    makespan_var = model.NewIntVar(0, MAX_HORIZON, "makespan")

    for job in uncompleted_jobs:
        due_scaled = int(round(job.due_date * SCALE))
        t_var = model.NewIntVar(0, MAX_HORIZON, f"tardiness_{job.id}")
        model.Add(t_var >= job_end_vars[job.id] - due_scaled)
        tardiness_vars.append(t_var)
        # Weighted by job priority (1 to 4) * weight_tardiness
        coeff = int(round(job.priority * recovery_req.weight_tardiness))
        tardiness_coeffs.append(coeff)

        model.Add(makespan_var >= job_end_vars[job.id])

    # Reassignment stability penalty
    reassign_vars: List[Any] = []
    reassign_coeffs: List[int] = []
    for job in uncompleted_jobs:
        orig = original_assignment_map.get(job.id)
        if orig and orig.machine_id in job_machine_bools[job.id]:
            orig_bool = job_machine_bools[job.id][orig.machine_id]
            # If not assigned to original machine, penalize
            # 1 - orig_bool: penalize with weight_stability * SCALE
            stab_penalty = int(round(recovery_req.weight_stability * SCALE))
            reassign_vars.append(orig_bool)
            reassign_coeffs.append(-stab_penalty) # maximizing orig_bool is minimizing penalty

    # Total objective
    objective_terms = []
    for var, coeff in zip(tardiness_vars, tardiness_coeffs):
        objective_terms.append(var * coeff)
    objective_terms.append(makespan_var * int(round(recovery_req.weight_makespan)))
    for b_var, coeff in zip(reassign_vars, reassign_coeffs):
        objective_terms.append(b_var * coeff)

    model.Minimize(sum(objective_terms))

    # Solve using CP-SAT
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = recovery_req.solver_timeout_seconds
    solver.parameters.num_search_workers = 4

    solve_status = solver.Solve(model)
    elapsed_seconds = time.perf_counter() - start_perf_time

    recovered_assignments: List[ScheduleAssignment] = []

    if solve_status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        status_name = "OPTIMAL" if solve_status == cp_model.OPTIMAL else "FEASIBLE"

        # Re-attach completed assignments
        for c_assign in completed_jobs.values():
            recovered_assignments.append(
                ScheduleAssignment(
                    job_id=c_assign.job_id,
                    job_name=c_assign.job_name,
                    machine_id=c_assign.machine_id,
                    start_time=c_assign.start_time,
                    end_time=c_assign.end_time,
                    duration=c_assign.duration,
                    status=JobStatus.COMPLETED,
                    due_date=c_assign.due_date,
                    priority=c_assign.priority,
                    is_delayed=c_assign.is_delayed,
                    delay_hours=c_assign.delay_hours
                )
            )

        # Extract newly scheduled assignments
        for job in uncompleted_jobs:
            start_val = solver.Value(job_start_vars[job.id]) / float(SCALE)
            end_val = solver.Value(job_end_vars[job.id]) / float(SCALE)

            # Find chosen machine
            chosen_machine = job.preferred_machine
            for m_id, b_var in job_machine_bools[job.id].items():
                if solver.Value(b_var) == 1:
                    chosen_machine = m_id
                    break

            is_delayed = end_val > (job.due_date + 1e-4)
            delay_hrs = max(0.0, end_val - job.due_date)

            status = JobStatus.DELAYED if is_delayed else JobStatus.PENDING
            if start_val <= current_time < end_val:
                status = JobStatus.IN_PROGRESS

            recovered_assignments.append(
                ScheduleAssignment(
                    job_id=job.id,
                    job_name=job.name,
                    machine_id=chosen_machine,
                    start_time=round(start_val, 2),
                    end_time=round(end_val, 2),
                    duration=round(job.duration_hours, 2),
                    status=status,
                    due_date=job.due_date,
                    priority=job.priority,
                    is_delayed=is_delayed,
                    delay_hours=round(delay_hrs, 2)
                )
            )

        # Sort assignments by start_time
        recovered_assignments.sort(key=lambda a: a.start_time)

        # Verify physical constraints
        is_valid, validation_errors = validate_schedule_constraints(
            machines, jobs, recovered_assignments
        )

        solver_info = {
            "algorithm": "Google OR-Tools CP-SAT (Integer Programming)",
            "status": status_name,
            "objective_value": solver.ObjectiveValue() if solve_status == cp_model.OPTIMAL else None,
            "solve_time_ms": round(elapsed_seconds * 1000, 2),
            "num_jobs_recovered": len(uncompleted_jobs),
            "is_valid": is_valid,
            "validation_errors": validation_errors,
            "reassignments_count": sum(
                1 for a in recovered_assignments
                if a.job_id in original_assignment_map and a.machine_id != original_assignment_map[a.job_id].machine_id
            )
        }

        return recovered_assignments, solver_info

    else:
        # Fallback to smart heuristic if CP-SAT returned infeasible
        return _heuristic_recovery_fallback(
            machines, jobs, completed_jobs, uncompleted_jobs,
            current_time, breakdown, original_assignment_map, elapsed_seconds
        )


def _heuristic_recovery_fallback(
    machines: List[Machine],
    jobs: List[Job],
    completed_jobs: Dict[str, ScheduleAssignment],
    uncompleted_jobs: List[Job],
    current_time: float,
    breakdown: Optional[MachineBreakdown],
    original_map: Dict[str, ScheduleAssignment],
    elapsed_so_far: float
) -> Tuple[List[ScheduleAssignment], Dict[str, Any]]:
    """
    Priority-Aware Earliest Due Date heuristic with alternative machine routing.
    Used as an operational fail-safe to guarantee a valid recovery schedule.
    """
    start_heuristic = time.perf_counter()
    machine_available: Dict[str, float] = {m.id: current_time for m in machines}

    # If breakdown, machine unavailable until breakdown ends
    if breakdown:
        bd_end = breakdown.start_time + breakdown.duration_hours
        machine_available[breakdown.machine_id] = max(
            machine_available[breakdown.machine_id], bd_end
        )

    # Preserve completed jobs
    recovered: List[ScheduleAssignment] = list(completed_jobs.values())
    job_end_times: Dict[str, float] = {a.job_id: a.end_time for a in completed_jobs.values()}

    # Sort uncompleted jobs by priority (descending), then due_date (ascending)
    sorted_uncompleted = sorted(uncompleted_jobs, key=lambda j: (-j.priority, j.due_date))

    for job in sorted_uncompleted:
        # Candidate machines
        candidates = [m for m in job.compatible_machines]
        # Choose machine offering earliest completion
        best_m = candidates[0]
        best_start = 1e9
        best_end = 1e9

        for m_id in candidates:
            # Check predecessor
            m_avail = machine_available[m_id]
            earliest = max(m_avail, job.release_time, current_time)
            if job.predecessor_id and job.predecessor_id in job_end_times:
                earliest = max(earliest, job_end_times[job.predecessor_id])

            cand_end = earliest + job.duration_hours
            if cand_end < best_end:
                best_end = cand_end
                best_start = earliest
                best_m = m_id

        machine_available[best_m] = best_end
        job_end_times[job.id] = best_end

        is_delayed = best_end > job.due_date
        delay = max(0.0, best_end - job.due_date)

        recovered.append(
            ScheduleAssignment(
                job_id=job.id,
                job_name=job.name,
                machine_id=best_m,
                start_time=round(best_start, 2),
                end_time=round(best_end, 2),
                duration=round(job.duration_hours, 2),
                status=JobStatus.DELAYED if is_delayed else JobStatus.PENDING,
                due_date=job.due_date,
                priority=job.priority,
                is_delayed=is_delayed,
                delay_hours=round(delay, 2)
            )
        )

    recovered.sort(key=lambda a: a.start_time)
    is_valid, validation_errors = validate_schedule_constraints(machines, jobs, recovered)

    solver_info = {
        "algorithm": "Priority-Aware Earliest Due Date Heuristic (Fallback)",
        "status": "HEURISTIC_FEASIBLE",
        "solve_time_ms": round((elapsed_so_far + (time.perf_counter() - start_heuristic)) * 1000, 2),
        "num_jobs_recovered": len(uncompleted_jobs),
        "is_valid": is_valid,
        "validation_errors": validation_errors,
        "reassignments_count": sum(
            1 for a in recovered
            if a.job_id in original_map and a.machine_id != original_map[a.job_id].machine_id
        )
    }

    return recovered, solver_info
