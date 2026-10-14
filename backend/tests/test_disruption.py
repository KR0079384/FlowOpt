import pytest
from backend.app.engine.factory_data import get_default_machines, get_default_jobs
from backend.app.engine.scheduler import build_baseline_schedule
from backend.app.engine.disruption import apply_disruption
from backend.app.models.schemas import (
    MachineBreakdown, MaterialDelay, DisruptionRequest, MachineStatus, JobStatus
)


def test_machine_breakdown_disruption():
    machines = get_default_machines()
    jobs = get_default_jobs()
    baseline = build_baseline_schedule(machines, jobs)

    req = DisruptionRequest(
        current_time=8.0,
        breakdown=MachineBreakdown(
            machine_id="M1",
            start_time=8.0,
            duration_hours=8.0,
            description="Spindle bearing seizure"
        )
    )

    up_machines, up_jobs, dis_schedule, active_disruptions = apply_disruption(
        machines, jobs, baseline, req
    )

    # Broken machine status
    m1 = next(m for m in up_machines if m.id == "M1")
    assert m1.status == MachineStatus.DISRUPTED

    # Active disruptions
    assert len(active_disruptions) == 1
    assert active_disruptions[0]["type"] == "machine_breakdown"
    assert active_disruptions[0]["machine_id"] == "M1"

    # Any job on M1 that was not completed before 8.0 must end after 16.0 (8 + 8)
    for a in dis_schedule:
        if a.machine_id == "M1" and a.start_time >= 8.0:
            assert a.start_time >= 16.0


def test_material_delay_disruption():
    machines = get_default_machines()
    jobs = get_default_jobs()
    baseline = build_baseline_schedule(machines, jobs)

    req = DisruptionRequest(
        current_time=6.0,
        material_delay=MaterialDelay(
            job_id="JOB-104",
            delay_hours=6.0,
            material_name="Inconel Billets"
        )
    )

    up_machines, up_jobs, dis_schedule, active_disruptions = apply_disruption(
        machines, jobs, baseline, req
    )

    j104 = next(j for j in up_jobs if j.id == "JOB-104")
    assert j104.release_time >= 12.0 # 6.0 + 6.0

    a104 = next(a for a in dis_schedule if a.job_id == "JOB-104")
    assert a104.start_time >= 12.0
