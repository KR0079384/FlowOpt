import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "FlowOpt" in data["system"]


def test_factory_state_endpoint():
    response = client.get("/api/factory/state")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "baseline"
    assert len(data["machines"]) == 5
    assert len(data["jobs"]) == 15
    assert len(data["schedule"]) == 15
    assert data["kpis"]["on_time_delivery_rate"] == 100.0


def test_disruption_and_recovery_flow():
    # 1. Reset
    r_reset = client.post("/api/simulation/reset")
    assert r_reset.status_code == 200

    # 2. Disrupt with M1 breakdown
    disruption_payload = {
        "current_time": 8.0,
        "breakdown": {
            "machine_id": "M1",
            "start_time": 8.0,
            "duration_hours": 8.0,
            "description": "Spindle motor overheating"
        }
    }
    r_disrupt = client.post("/api/simulation/disrupt", json=disruption_payload)
    assert r_disrupt.status_code == 200
    dis_data = r_disrupt.json()
    assert dis_data["status"] == "disrupted"
    assert len(dis_data["active_disruptions"]) == 1
    assert dis_data["comparison"] is not None

    # 3. Recover
    r_recover = client.post("/api/simulation/recover", json={"solver_timeout_seconds": 5.0})
    assert r_recover.status_code == 200
    rec_data = r_recover.json()
    assert rec_data["status"] == "recovered"
    assert rec_data["optimizer_info"] is not None
    assert rec_data["optimizer_info"]["is_valid"] is True
    # Tardiness should be significantly less than or equal to disrupted
    assert rec_data["kpis"]["total_tardiness"] <= dis_data["kpis"]["total_tardiness"]


def test_preset_scenarios():
    r = client.get("/api/simulation/scenarios")
    assert r.status_code == 200
    scenarios = r.json()
    assert len(scenarios) >= 3

    # Apply first preset
    s_id = scenarios[0]["id"]
    r_apply = client.post(f"/api/simulation/scenario/{s_id}")
    assert r_apply.status_code == 200
    data = r_apply.json()
    assert data["status"] == "disrupted"
    assert len(data["active_disruptions"]) >= 1
