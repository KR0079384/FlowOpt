"""
FlowOpt Baseline Production Scheduler & Constraint Validator.
Constructs deterministic initial schedules and enforces strict physical factory constraints.
"""
from typing import List, Dict, Tuple, Optional
from backend.app.models.schemas import Machine, Job, ScheduleAssignment, JobStatus


def validate_schedule_constraints(
    machines: List[Machine],
    jobs: List[Job],
    assignments: List[ScheduleAssignment]
) -> Tuple[bool, List[str]]:
    """
    Validates that a schedule adheres to all physical and industrial rules:
    1. No job overlaps on the same machine.
    2. Jobs are only assigned to compatible machines.
    3. Precedence dependencies are strictly respected.
    4. Start time >= job release time.
    5. Durations and timestamps are non-negative.
    """
    errors: List[str] = []
    job_map: Dict[str, Job] = {j.id: j for j in jobs}
    machine_ids = {m.id for m in machines}
    assignment_map: Dict[str, ScheduleAssignment] = {a.job_id: a for a in assignments}

    # Group assignments by machine
    machine_schedules: Dict[str, List[ScheduleAssignment]] = {m_id: [] for m_id in machine_ids}

    for a in assignments:
        job = job_map.get(a.job_id)
        if not job:
            errors.append(f"Assignment references unknown job '{a.job_id}'")
            continue

        if a.machine_id not in machine_ids:
            errors.append(f"Job {a.job_id} assigned to unknown machine '{a.machine_id}'")
            continue

        # Machine compatibility check
        if a.machine_id not in job.compatible_machines:
            errors.append(
                f"Job {a.job_id} assigned to incompatible machine {a.machine_id}. "
                f"Compatible: {job.compatible_machines}"
            )

        # Non-negative times
        if a.start_time < 0 or a.end_time < a.start_time:
            errors.append(f"Job {a.job_id} has invalid time window: [{a.start_time}, {a.end_time}]")

        # Release time constraint
        if a.start_time < (job.release_time - 1e-4):
            errors.append(
                f"Job {a.job_id} starts at {a.start_time:.2f} before release time {job.release_time:.2f}"
            )

        # Precedence constraint
        if job.predecessor_id:
            pred_assignment = assignment_map.get(job.predecessor_id)
            if not pred_assignment:
                errors.append(
                    f"Job {a.job_id} has predecessor {job.predecessor_id} which has no assignment"
                )
            elif a.start_time < (pred_assignment.end_time - 1e-4):
                errors.append(
                    f"Precedence violation: Job {a.job_id} starts at {a.start_time:.2f} before "
                    f"predecessor {job.predecessor_id} completes at {pred_assignment.end_time:.2f}"
                )

        machine_schedules[a.machine_id].append(a)

    # Check for overlapping jobs on the same machine
    for m_id, m_assignments in machine_schedules.items():
        sorted_tasks = sorted(m_assignments, key=lambda x: x.start_time)
        for i in range(len(sorted_tasks) - 1):
            cur = sorted_tasks[i]
            nxt = sorted_tasks[i + 1]
            if cur.end_time > (nxt.start_time + 1e-4):
                errors.append(
                    f"Overlap conflict on machine {m_id}: {cur.job_id} [{cur.start_time:.1f}, {cur.end_time:.1f}] "
                    f"overlaps with {nxt.job_id} [{nxt.start_time:.1f}, nxt.start_time={nxt.start_time:.1f}]"
                )

    return len(errors) == 0, errors


def build_baseline_schedule(machines: List[Machine], jobs: List[Job]) -> List[ScheduleAssignment]:
    """
    Constructs a deterministic, conflict-free baseline production schedule.
    Schedules dependent jobs after their predecessors, respecting preferred machines and due dates.
    """
    job_map: Dict[str, Job] = {j.id: j for j in jobs}
    machine_available_at: Dict[str, float] = {m.id: 0.0 for m in machines}
    assignments: List[ScheduleAssignment] = []
    scheduled_job_ends: Dict[str, float] = {}

    # Sort jobs by dependency order, then priority (desc), then due date (asc)
    # Perform topological sort
    visited = set()
    ordered_jobs: List[Job] = []

    def visit(job: Job):
        if job.id in visited:
            return
        if job.predecessor_id and job.predecessor_id in job_map:
            visit(job_map[job.predecessor_id])
        visited.add(job.id)
        ordered_jobs.append(job)

    # Sort remaining jobs deterministically by due date and priority
    sorted_initial = sorted(jobs, key=lambda j: (-j.priority, j.due_date))
    for j in sorted_initial:
        visit(j)

    for job in ordered_jobs:
        # Chosen machine is preferred_machine if available, else first compatible
        target_machine = job.preferred_machine if job.preferred_machine in job.compatible_machines else job.compatible_machines[0]

        # Earliest start is max of machine availability, release time, and predecessor completion
        earliest_start = max(machine_available_at[target_machine], job.release_time)
        if job.predecessor_id and job.predecessor_id in scheduled_job_ends:
            earliest_start = max(earliest_start, scheduled_job_ends[job.predecessor_id])

        end_time = earliest_start + job.duration_hours
        machine_available_at[target_machine] = end_time
        scheduled_job_ends[job.id] = end_time

        is_delayed = end_time > job.due_date
        delay = max(0.0, end_time - job.due_date)

        assignments.append(
            ScheduleAssignment(
                job_id=job.id,
                job_name=job.name,
                machine_id=target_machine,
                start_time=round(earliest_start, 2),
                end_time=round(end_time, 2),
                duration=round(job.duration_hours, 2),
                status=JobStatus.PENDING,
                due_date=job.due_date,
                priority=job.priority,
                is_delayed=is_delayed,
                delay_hours=round(delay, 2)
            )
        )

    # Verify baseline schedule validity
    is_valid, errs = validate_schedule_constraints(machines, jobs, assignments)
    if not is_valid:
        raise ValueError(f"Baseline schedule generation produced constraint violations: {errs}")

    return assignments
