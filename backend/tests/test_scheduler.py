import pytest
from backend.app.engine.factory_data import get_default_machines, get_default_jobs
from backend.app.engine.scheduler import build_baseline_schedule, validate_schedule_constraints
from backend.app.models.schemas import ScheduleAssignment, JobStatus


def test_baseline_schedule_generation():
    machines = get_default_machines()
    jobs = get_default_jobs()
    schedule = build_baseline_schedule(machines, jobs)

    assert len(schedule) == len(jobs)
    is_valid, errors = validate_schedule_constraints(machines, jobs, schedule)
    assert is_valid, f"Baseline schedule has constraint errors: {errors}"
    assert len(errors) == 0


def test_baseline_precedence_respected():
    machines = get_default_machines()
    jobs = get_default_jobs()
    schedule = build_baseline_schedule(machines, jobs)
    assign_map = {a.job_id: a for a in schedule}

    # JOB-102 depends on JOB-101
    assert "JOB-101" in assign_map
    assert "JOB-102" in assign_map
    assert assign_map["JOB-102"].start_time >= assign_map["JOB-101"].end_time

    # JOB-106 depends on JOB-105
    assert "JOB-105" in assign_map
    assert "JOB-106" in assign_map
    assert assign_map["JOB-106"].start_time >= assign_map["JOB-105"].end_time


def test_validator_catches_overlap():
    machines = get_default_machines()
    jobs = get_default_jobs()
    schedule = build_baseline_schedule(machines, jobs)

    # Artificially modify one assignment to overlap with another on the same machine
    bad_schedule = [a.model_copy() for a in schedule]
    # Set the second job on machine M1 to start before the first job finishes
    m1_jobs = [a for a in bad_schedule if a.machine_id == "M1"]
    assert len(m1_jobs) >= 2
    m1_jobs[1].start_time = m1_jobs[0].start_time + 0.5
    m1_jobs[1].end_time = m1_jobs[1].start_time + m1_jobs[1].duration

    is_valid, errors = validate_schedule_constraints(machines, jobs, bad_schedule)
    assert not is_valid
    assert any("Overlap conflict" in err for err in errors)


def test_validator_catches_incompatible_machine():
    machines = get_default_machines()
    jobs = get_default_jobs()
    schedule = build_baseline_schedule(machines, jobs)

    # JOB-103 is a lathe job only compatible with M2. Assign to M3 (laser).
    bad_schedule = [a.model_copy() for a in schedule]
    for a in bad_schedule:
        if a.job_id == "JOB-103":
            a.machine_id = "M3"

    is_valid, errors = validate_schedule_constraints(machines, jobs, bad_schedule)
    assert not is_valid
    assert any("incompatible machine" in err for err in errors)
