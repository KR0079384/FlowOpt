import pytest
from backend.app.engine.factory_data import get_default_machines, get_default_jobs
from backend.app.engine.scheduler import build_baseline_schedule, validate_schedule_constraints
from backend.app.engine.disruption import apply_disruption
from backend.app.engine.optimizer import run_recovery_optimization
from backend.app.engine.kpi import calculate_schedule_kpis
from backend.app.models.schemas import MachineBreakdown, DisruptionRequest, RecoveryRequest, JobStatus


def test_recovery_optimization_reduces_tardiness():
    machines = get_default_machines()
    jobs = get_default_jobs()
    baseline = build_baseline_schedule(machines, jobs)

    # Disruption: M1 breaks down at hour 8 for 8 hours
    bd = MachineBreakdown(
        machine_id="M1",
        start_time=8.0,
        duration_hours=8.0,
        description="Spindle bearing seizure"
    )
    req = DisruptionRequest(current_time=8.0, breakdown=bd)
    up_machines, up_jobs, dis_schedule, _ = apply_disruption(machines, jobs, baseline, req)

    dis_kpis = calculate_schedule_kpis(up_machines, up_jobs, dis_schedule)
    assert dis_kpis.total_tardiness > 0, "Disruption should have induced tardiness"

    # Run recovery optimization
    rec_schedule, solver_info = run_recovery_optimization(
        machines=up_machines,
        jobs=up_jobs,
        current_schedule=dis_schedule,
        current_time=8.0,
        breakdown=bd,
        recovery_req=RecoveryRequest(solver_timeout_seconds=5.0)
    )

    assert solver_info["status"] in ("OPTIMAL", "FEASIBLE", "HEURISTIC_FEASIBLE")
    assert solver_info["is_valid"] is True, f"Constraint errors: {solver_info.get('validation_errors')}"

    # Verify physical validity
    is_valid, errors = validate_schedule_constraints(up_machines, up_jobs, rec_schedule)
    assert is_valid, f"Validation errors in recovered schedule: {errors}"

    # Verify no job runs on M1 during [8.0, 16.0]
    for a in rec_schedule:
        if a.machine_id == "M1":
            assert not (a.start_time < 16.0 and a.end_time > 8.0), (
                f"Job {a.job_id} scheduled during breakdown window on M1: [{a.start_time}, {a.end_time}]"
            )

    rec_kpis = calculate_schedule_kpis(up_machines, up_jobs, rec_schedule)
    # The recovery algorithm should achieve measurably lower or equal tardiness / makespan
    assert rec_kpis.total_tardiness <= dis_kpis.total_tardiness
    assert rec_kpis.on_time_delivery_rate >= dis_kpis.on_time_delivery_rate


def test_completed_jobs_frozen():
    machines = get_default_machines()
    jobs = get_default_jobs()
    baseline = build_baseline_schedule(machines, jobs)

    bd = MachineBreakdown(machine_id="M1", start_time=8.0, duration_hours=8.0)
    req = DisruptionRequest(current_time=8.0, breakdown=bd)
    up_machines, up_jobs, dis_schedule, _ = apply_disruption(machines, jobs, baseline, req)

    # In baseline, JOB-101 completes at hour 4.0 (< 8.0)
    rec_schedule, _ = run_recovery_optimization(
        machines=up_machines,
        jobs=up_jobs,
        current_schedule=dis_schedule,
        current_time=8.0,
        breakdown=bd
    )

    rec_map = {a.job_id: a for a in rec_schedule}
    base_map = {a.job_id: a for a in baseline}

    # Job completed before 8.0 must remain at identical machine and start/end time
    assert rec_map["JOB-101"].start_time == base_map["JOB-101"].start_time
    assert rec_map["JOB-101"].end_time == base_map["JOB-101"].end_time
    assert rec_map["JOB-101"].machine_id == base_map["JOB-101"].machine_id
    assert rec_map["JOB-101"].status == JobStatus.COMPLETED


def test_material_delay_recovery_respects_release_time():
    from backend.app.models.schemas import MaterialDelay

    machines = get_default_machines()
    jobs = get_default_jobs()
    baseline = build_baseline_schedule(machines, jobs)

    # Delay material for JOB-104 by 6 hours at T=6.0 -> release_time = 12.0
    md = MaterialDelay(
        job_id="JOB-104",
        delay_hours=6.0,
        material_name="Specialty Inconel Billets"
    )
    req = DisruptionRequest(current_time=6.0, material_delay=md)
    up_machines, up_jobs, dis_schedule, _ = apply_disruption(machines, jobs, baseline, req)

    rec_schedule, solver_info = run_recovery_optimization(
        machines=up_machines,
        jobs=up_jobs,
        current_schedule=dis_schedule,
        current_time=6.0,
        material_delay=md,
        recovery_req=RecoveryRequest(solver_timeout_seconds=5.0)
    )

    assert solver_info["status"] in ("OPTIMAL", "FEASIBLE")
    assert solver_info["is_valid"] is True

    # Check that JOB-104 starts at or after 12.0
    rec_j104 = next(a for a in rec_schedule if a.job_id == "JOB-104")
    assert rec_j104.start_time >= 12.0 - 1e-4

    # Check constraints on entire schedule
    is_valid, errors = validate_schedule_constraints(up_machines, up_jobs, rec_schedule)
    assert is_valid, f"Constraint violations: {errors}"

