"""
FlowOpt Production KPI & Schedule Comparison Engine.
Computes mathematically rigorous manufacturing performance metrics:
Makespan, Tardiness, On-Time Delivery Rate, Machine Utilisation, and Before/After Diffs.
"""
from typing import List, Dict, Optional
from backend.app.models.schemas import (
    Machine, Job, ScheduleAssignment, ScheduleKPI, KPIComparison, JobDiff, JobStatus
)


def calculate_schedule_kpis(
    machines: List[Machine],
    jobs: List[Job],
    schedule: List[ScheduleAssignment]
) -> ScheduleKPI:
    """
    Computes key performance indicators for a given production schedule:
    - Makespan: max(end_time)
    - Total Tardiness: sum(max(0, end_time - due_date))
    - Weighted Tardiness: sum(priority * max(0, end_time - due_date))
    - On-Time Delivery Rate (%): on_time_jobs / total_jobs * 100
    - Machine Utilisation (%): total_processing_hours / (num_machines * makespan) * 100
    """
    if not schedule:
        return ScheduleKPI(
            makespan=0.0,
            total_tardiness=0.0,
            weighted_tardiness=0.0,
            on_time_delivery_rate=100.0,
            machine_utilisation=0.0,
            total_jobs=len(jobs),
            completed_jobs_count=0,
            pending_jobs_count=len(jobs),
            delayed_jobs_count=0
        )

    makespan = max(a.end_time for a in schedule)
    total_tardiness = 0.0
    weighted_tardiness = 0.0
    on_time_count = 0
    delayed_count = 0
    completed_count = 0
    pending_count = 0

    total_processing_hours = sum(a.duration for a in schedule)
    num_machines = max(1, len(machines))

    for a in schedule:
        tardiness = max(0.0, a.end_time - a.due_date)
        total_tardiness += tardiness
        weighted_tardiness += (tardiness * a.priority)

        if a.end_time <= a.due_date:
            on_time_count += 1
        else:
            delayed_count += 1

        if a.status == JobStatus.COMPLETED:
            completed_count += 1
        else:
            pending_count += 1

    total_jobs = len(schedule)
    on_time_rate = (on_time_count / total_jobs * 100.0) if total_jobs > 0 else 100.0
    
    # Utilisation = total busy hours / (machines * makespan)
    if makespan > 0 and num_machines > 0:
        utilisation = (total_processing_hours / (num_machines * makespan)) * 100.0
    else:
        utilisation = 0.0

    return ScheduleKPI(
        makespan=round(makespan, 2),
        total_tardiness=round(total_tardiness, 2),
        weighted_tardiness=round(weighted_tardiness, 2),
        on_time_delivery_rate=round(on_time_rate, 1),
        machine_utilisation=round(min(100.0, utilisation), 1),
        total_jobs=total_jobs,
        completed_jobs_count=completed_count,
        pending_jobs_count=pending_count,
        delayed_jobs_count=delayed_count
    )


def build_kpi_comparison(
    baseline_kpis: ScheduleKPI,
    disrupted_kpis: ScheduleKPI,
    recovered_kpis: Optional[ScheduleKPI],
    disrupted_schedule: List[ScheduleAssignment],
    recovered_schedule: Optional[List[ScheduleAssignment]] = None
) -> KPIComparison:
    """
    Computes before-and-after deltas and job-by-job shift analysis.
    Highlights recovered vs delayed jobs, makespan savings, and tardiness reductions.
    """
    if recovered_kpis and recovered_schedule:
        # Comparison: Disrupted vs Recovered
        makespan_delta = round(recovered_kpis.makespan - disrupted_kpis.makespan, 2)
        tardiness_delta = round(recovered_kpis.total_tardiness - disrupted_kpis.total_tardiness, 2)
        on_time_rate_delta = round(recovered_kpis.on_time_delivery_rate - disrupted_kpis.on_time_delivery_rate, 1)
        machine_utilisation_delta = round(recovered_kpis.machine_utilisation - disrupted_kpis.machine_utilisation, 1)
        recovery_gain_hours = round(max(0.0, disrupted_kpis.total_tardiness - recovered_kpis.total_tardiness), 2)

        # Job-by-job shifts
        disrupted_map = {a.job_id: a for a in disrupted_schedule}
        job_shifts: List[JobDiff] = []

        for rec_a in recovered_schedule:
            dis_a = disrupted_map.get(rec_a.job_id)
            if not dis_a:
                continue

            tardiness_before = max(0.0, dis_a.end_time - dis_a.due_date)
            tardiness_after = max(0.0, rec_a.end_time - rec_a.due_date)
            shift_hours = round(rec_a.end_time - dis_a.end_time, 2)

            if tardiness_before > 0 and tardiness_after < tardiness_before:
                status_change = "recovered"
            elif dis_a.machine_id != rec_a.machine_id:
                status_change = "reassigned"
            elif shift_hours > 0.05:
                status_change = "delayed"
            else:
                status_change = "unchanged"

            job_shifts.append(
                JobDiff(
                    job_id=rec_a.job_id,
                    job_name=rec_a.job_name,
                    priority=rec_a.priority,
                    due_date=rec_a.due_date,
                    machine_from=dis_a.machine_id,
                    machine_to=rec_a.machine_id,
                    start_before=dis_a.start_time,
                    start_after=rec_a.start_time,
                    end_before=dis_a.end_time,
                    end_after=rec_a.end_time,
                    shift_hours=shift_hours,
                    tardiness_before=round(tardiness_before, 2),
                    tardiness_after=round(tardiness_after, 2),
                    status_change=status_change
                )
            )

        # Sort job shifts: recovered first, then reassigned, then delayed
        sort_order = {"recovered": 0, "reassigned": 1, "delayed": 2, "unchanged": 3}
        job_shifts.sort(key=lambda s: (sort_order.get(s.status_change, 9), s.shift_hours))

        return KPIComparison(
            baseline_kpis=baseline_kpis,
            disrupted_kpis=disrupted_kpis,
            recovered_kpis=recovered_kpis,
            makespan_delta=makespan_delta,
            tardiness_delta=tardiness_delta,
            on_time_rate_delta=on_time_rate_delta,
            machine_utilisation_delta=machine_utilisation_delta,
            recovery_gain_hours=recovery_gain_hours,
            job_shifts=job_shifts
        )
    else:
        # Comparison: Baseline vs Disrupted
        makespan_delta = round(disrupted_kpis.makespan - baseline_kpis.makespan, 2)
        tardiness_delta = round(disrupted_kpis.total_tardiness - baseline_kpis.total_tardiness, 2)
        on_time_rate_delta = round(disrupted_kpis.on_time_delivery_rate - baseline_kpis.on_time_delivery_rate, 1)
        machine_utilisation_delta = round(disrupted_kpis.machine_utilisation - baseline_kpis.machine_utilisation, 1)

        return KPIComparison(
            baseline_kpis=baseline_kpis,
            disrupted_kpis=disrupted_kpis,
            recovered_kpis=None,
            makespan_delta=makespan_delta,
            tardiness_delta=tardiness_delta,
            on_time_rate_delta=on_time_rate_delta,
            machine_utilisation_delta=machine_utilisation_delta,
            recovery_gain_hours=0.0,
            job_shifts=[]
        )
