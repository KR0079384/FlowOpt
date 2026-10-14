import pytest
from backend.app.models.schemas import (
    Machine, MachineStatus, Job, JobStatus, ScheduleAssignment,
    MachineBreakdown, MaterialDelay, DisruptionRequest, ScheduleKPI
)


def test_machine_model_creation():
    m = Machine(
        id="M1",
        name="5-Axis CNC Mill Alpha",
        category="Milling",
        status=MachineStatus.OPERATIONAL,
        efficiency=1.0,
        hourly_rate=145.0
    )
    assert m.id == "M1"
    assert m.status == MachineStatus.OPERATIONAL
    assert m.efficiency == 1.0


def test_job_model_creation():
    job = Job(
        id="JOB-101",
        name="Turbine Blade Roughing",
        compatible_machines=["M1", "M5"],
        preferred_machine="M1",
        duration_hours=4.0,
        priority=3,
        due_date=10.0,
        release_time=0.0
    )
    assert job.id == "JOB-101"
    assert len(job.compatible_machines) == 2
    assert job.priority == 3
    assert job.predecessor_id is None


def test_disruption_models():
    bd = MachineBreakdown(
        machine_id="M1",
        start_time=8.0,
        duration_hours=6.0,
        description="Spindle bearing seizure"
    )
    md = MaterialDelay(
        job_id="JOB-104",
        delay_hours=4.0,
        material_name="Inconel Billets"
    )
    req = DisruptionRequest(current_time=8.0, breakdown=bd, material_delay=md)
    assert req.current_time == 8.0
    assert req.breakdown.machine_id == "M1"
    assert req.material_delay.delay_hours == 4.0
