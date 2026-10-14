"""
FlowOpt Disruption Simulator.
Injects machine breakdowns and material delivery delays, detecting conflicts
and simulating the unoptimized cascading impact.
"""
from typing import List, Dict, Tuple, Any, Optional
from backend.app.models.schemas import (
    Machine, MachineStatus, Job, ScheduleAssignment, JobStatus,
    DisruptionRequest, MachineBreakdown, MaterialDelay
)


def apply_disruption(
    machines: List[Machine],
    jobs: List[Job],
    baseline_schedule: List[ScheduleAssignment],
    request: DisruptionRequest
) -> Tuple[List[Machine], List[Job], List[ScheduleAssignment], List[Dict[str, Any]]]:
    """
    Applies disruption events (breakdown, material delay) at current_time.
    Computes naive cascading delays if no recovery algorithm is applied.
    Returns:
      - updated machines list (status marked DISRUPTED if broken)
      - updated jobs list (release_time increased if material delayed)
      - naive disrupted schedule (showing severe unrecovered delays)
      - active disruptions summary
    """
    current_time = request.current_time
    active_disruptions: List[Dict[str, Any]] = []

    # Deep copies of machines and jobs to avoid mutating base definitions
    sim_machines = [m.model_copy() for m in machines]
    sim_jobs = [j.model_copy() for j in jobs]
    job_map = {j.id: j for j in sim_jobs}

    breakdown_m_id: Optional[str] = None
    bd_start: float = 0.0
    bd_end: float = 0.0

    if request.breakdown:
        breakdown_m_id = request.breakdown.machine_id
        bd_start = request.breakdown.start_time
        bd_end = bd_start + request.breakdown.duration_hours

        # Update machine status
        for m in sim_machines:
            if m.id == breakdown_m_id:
                m.status = MachineStatus.DISRUPTED

        active_disruptions.append({
            "type": "machine_breakdown",
            "machine_id": breakdown_m_id,
            "start_time": bd_start,
            "end_time": bd_end,
            "duration": request.breakdown.duration_hours,
            "description": request.breakdown.description
        })

    if request.material_delay:
        delay_job_id = request.material_delay.job_id
        delay_hrs = request.material_delay.delay_hours

        for j in sim_jobs:
            if j.id == delay_job_id:
                j.release_time = max(j.release_time, current_time) + delay_hrs

        active_disruptions.append({
            "type": "material_delay",
            "job_id": delay_job_id,
            "delay_hours": delay_hrs,
            "new_release_time": job_map[delay_job_id].release_time,
            "material_name": request.material_delay.material_name
        })

    # Build the naive disrupted schedule (without intelligent rerouting)
    # 1. Jobs that finished before current_time are completed
    # 2. Jobs on the broken machine during or after the breakdown are delayed past bd_end
    # 3. Dependent jobs are pushed back to satisfy precedence

    # Sort baseline tasks by their original start time
    sorted_baseline = sorted(baseline_schedule, key=lambda a: a.start_time)
    disrupted_assignments: Dict[str, ScheduleAssignment] = {}
    machine_available: Dict[str, float] = {m.id: 0.0 for m in sim_machines}

    # First pass: jobs unaffected or already completed before current_time
    # We simulate time progression across machines
    for base_a in sorted_baseline:
        job = job_map[base_a.job_id]
        m_id = base_a.machine_id

        # Determine job start readiness
        earliest_machine = machine_available[m_id]
        earliest_start = max(earliest_machine, job.release_time)

        # Check dependency
        if job.predecessor_id and job.predecessor_id in disrupted_assignments:
            pred_end = disrupted_assignments[job.predecessor_id].end_time
            earliest_start = max(earliest_start, pred_end)

        # If on broken machine, check breakdown window conflict
        if m_id == breakdown_m_id:
            # If the job would be running or starting during the breakdown window
            planned_end = earliest_start + job.duration_hours
            if earliest_start < bd_end and planned_end > bd_start:
                # If it started strictly before current_time and before bd_start,
                # but extends into breakdown, it gets interrupted.
                # In naive shop floor, it halts and resumes after repairs finish.
                if earliest_start < bd_start:
                    worked_before_bd = bd_start - earliest_start
                    remaining_work = job.duration_hours - worked_before_bd
                    earliest_start = bd_end - worked_before_bd # resume window
                    # simpler naive formulation: job pushed to start after bd_end
                    earliest_start = bd_end
                else:
                    earliest_start = max(earliest_start, bd_end)

        new_end = earliest_start + job.duration_hours
        machine_available[m_id] = new_end

        # Determine job status relative to current_time
        if new_end <= current_time:
            status = JobStatus.COMPLETED
        elif earliest_start <= current_time < new_end:
            if m_id == breakdown_m_id and bd_start <= current_time < bd_end:
                status = JobStatus.INTERRUPTED
            else:
                status = JobStatus.IN_PROGRESS
        else:
            status = JobStatus.DELAYED if new_end > job.due_date else JobStatus.PENDING

        is_delayed = new_end > job.due_date
        delay_hrs = max(0.0, new_end - job.due_date)

        disrupted_assignments[job.id] = ScheduleAssignment(
            job_id=job.id,
            job_name=job.name,
            machine_id=m_id,
            start_time=round(earliest_start, 2),
            end_time=round(new_end, 2),
            duration=round(job.duration_hours, 2),
            status=status,
            due_date=job.due_date,
            priority=job.priority,
            is_delayed=is_delayed,
            delay_hours=round(delay_hrs, 2)
        )

    disrupted_schedule = list(disrupted_assignments.values())
    return sim_machines, sim_jobs, disrupted_schedule, active_disruptions
