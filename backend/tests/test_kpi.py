import pytest
from backend.app.engine.factory_data import get_default_machines, get_default_jobs
from backend.app.engine.scheduler import build_baseline_schedule
from backend.app.engine.kpi import calculate_schedule_kpis, build_kpi_comparison


def test_baseline_kpis():
    machines = get_default_machines()
    jobs = get_default_jobs()
    schedule = build_baseline_schedule(machines, jobs)

    kpis = calculate_schedule_kpis(machines, jobs, schedule)
    assert kpis.makespan > 0
    assert kpis.total_tardiness == 0.0 # Baseline schedule is on-time
    assert kpis.on_time_delivery_rate == 100.0
    assert 0.0 < kpis.machine_utilisation <= 100.0
    assert kpis.total_jobs == len(jobs)


def test_kpi_comparison_builder():
    machines = get_default_machines()
    jobs = get_default_jobs()
    baseline = build_baseline_schedule(machines, jobs)
    base_kpis = calculate_schedule_kpis(machines, jobs, baseline)

    # Fake disrupted schedule by shifting all ends by 5 hours
    dis_schedule = [
        a.model_copy(update={"start_time": a.start_time + 5, "end_time": a.end_time + 5})
        for a in baseline
    ]
    dis_kpis = calculate_schedule_kpis(machines, jobs, dis_schedule)

    comp = build_kpi_comparison(base_kpis, dis_kpis, None, dis_schedule, None)
    assert comp.makespan_delta == 5.0
    assert comp.tardiness_delta >= 0.0
