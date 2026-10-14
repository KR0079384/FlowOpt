"""
FastAPI REST Routes for FlowOpt Industrial Production Recovery Simulator.
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException

from backend.app.models.schemas import (
    FactoryState, SimulationStatus, DisruptionRequest, RecoveryRequest,
    ScenarioPreset, MachineBreakdown, MaterialDelay, ScheduleAssignment,
    ScheduleKPI, KPIComparison
)
from backend.app.engine.factory_data import get_default_machines, get_default_jobs
from backend.app.engine.scheduler import build_baseline_schedule
from backend.app.engine.disruption import apply_disruption
from backend.app.engine.optimizer import run_recovery_optimization
from backend.app.engine.kpi import calculate_schedule_kpis, build_kpi_comparison


class SimulationManager:
    def __init__(self):
        self.reset()

    def reset(self):
        self.machines = get_default_machines()
        self.jobs = get_default_jobs()
        self.current_time = 0.0
        self.status = SimulationStatus.BASELINE
        self.active_disruptions: List[Dict[str, Any]] = []
        self.last_disruption_req: Optional[DisruptionRequest] = None

        # Build clean baseline schedule
        self.baseline_schedule = build_baseline_schedule(self.machines, self.jobs)
        self.current_schedule = [a.model_copy() for a in self.baseline_schedule]
        self.disrupted_schedule: Optional[List[ScheduleAssignment]] = None
        self.recovered_schedule: Optional[List[ScheduleAssignment]] = None

        # Calculate KPIs
        self.baseline_kpis = calculate_schedule_kpis(self.machines, self.jobs, self.baseline_schedule)
        self.current_kpis = self.baseline_kpis.model_copy()
        self.disrupted_kpis: Optional[ScheduleKPI] = None
        self.recovered_kpis: Optional[ScheduleKPI] = None

        self.comparison: Optional[KPIComparison] = None
        self.optimizer_info: Optional[Dict[str, Any]] = None

    def disrupt(self, req: DisruptionRequest) -> FactoryState:
        self.last_disruption_req = req
        self.current_time = req.current_time

        # Apply disruption logic
        updated_machines, updated_jobs, dis_schedule, active_disruptions = apply_disruption(
            self.machines, self.jobs, self.baseline_schedule, req
        )

        self.machines = updated_machines
        self.jobs = updated_jobs
        self.disrupted_schedule = dis_schedule
        self.current_schedule = [a.model_copy() for a in dis_schedule]
        self.active_disruptions = active_disruptions
        self.status = SimulationStatus.DISRUPTED

        # Compute disrupted KPIs
        self.disrupted_kpis = calculate_schedule_kpis(self.machines, self.jobs, self.disrupted_schedule)
        self.current_kpis = self.disrupted_kpis.model_copy()

        # Build comparison against baseline
        self.comparison = build_kpi_comparison(
            baseline_kpis=self.baseline_kpis,
            disrupted_kpis=self.disrupted_kpis,
            recovered_kpis=None,
            disrupted_schedule=self.disrupted_schedule,
            recovered_schedule=None
        )
        self.optimizer_info = None
        return self.get_state()

    def recover(self, req: Optional[RecoveryRequest] = None) -> FactoryState:
        if self.status != SimulationStatus.DISRUPTED or self.disrupted_schedule is None:
            raise HTTPException(
                status_code=400,
                detail="Cannot run recovery: no active disruption in progress. Inject a disruption first."
            )

        if req is None:
            req = RecoveryRequest()

        breakdown = self.last_disruption_req.breakdown if self.last_disruption_req else None
        mat_delay = self.last_disruption_req.material_delay if self.last_disruption_req else None

        # Run OR-Tools recovery optimization
        rec_schedule, opt_info = run_recovery_optimization(
            machines=self.machines,
            jobs=self.jobs,
            current_schedule=self.disrupted_schedule,
            current_time=self.current_time,
            breakdown=breakdown,
            material_delay=mat_delay,
            recovery_req=req
        )

        self.recovered_schedule = rec_schedule
        self.current_schedule = [a.model_copy() for a in rec_schedule]
        self.status = SimulationStatus.RECOVERED
        self.optimizer_info = opt_info

        # Compute recovered KPIs
        self.recovered_kpis = calculate_schedule_kpis(self.machines, self.jobs, self.recovered_schedule)
        self.current_kpis = self.recovered_kpis.model_copy()

        # Build comparison: baseline vs disrupted vs recovered
        self.comparison = build_kpi_comparison(
            baseline_kpis=self.baseline_kpis,
            disrupted_kpis=self.disrupted_kpis,
            recovered_kpis=self.recovered_kpis,
            disrupted_schedule=self.disrupted_schedule,
            recovered_schedule=self.recovered_schedule
        )

        return self.get_state()

    def get_state(self) -> FactoryState:
        return FactoryState(
            simulation_name="FlowOpt Precision Plant Alpha",
            current_time=self.current_time,
            status=self.status,
            machines=self.machines,
            jobs=self.jobs,
            schedule=self.current_schedule,
            kpis=self.current_kpis,
            active_disruptions=self.active_disruptions,
            comparison=self.comparison,
            optimizer_info=self.optimizer_info
        )


# Global singleton instance
sim_manager = SimulationManager()
router = APIRouter(prefix="/api")


@router.get("/factory/state", response_model=FactoryState)
def get_factory_state():
    """Retrieve full live telemetry and schedule state."""
    return sim_manager.get_state()


@router.post("/simulation/reset", response_model=FactoryState)
def reset_simulation():
    """Reset the factory environment to clean deterministic baseline."""
    sim_manager.reset()
    return sim_manager.get_state()


@router.post("/simulation/disrupt", response_model=FactoryState)
def inject_disruption(payload: DisruptionRequest):
    """Trigger a machine breakdown or material arrival delay."""
    return sim_manager.disrupt(payload)


@router.post("/simulation/recover", response_model=FactoryState)
def optimize_recovery(payload: Optional[RecoveryRequest] = None):
    """Run mathematical recovery optimization using Google OR-Tools CP-SAT."""
    return sim_manager.recover(payload)


@router.get("/simulation/scenarios", response_model=List[ScenarioPreset])
def get_scenarios():
    """Returns curated industrial disruption scenarios for 1-click demonstration."""
    return [
        ScenarioPreset(
            id="spindle-failure-m1",
            name="CNC Mill M1 Spindle Failure",
            description="5-Axis CNC Mill M1 suffers high-speed spindle seizure at Hour 8.0, causing 8 hours of downtime.",
            disruption=DisruptionRequest(
                current_time=8.0,
                breakdown=MachineBreakdown(
                    machine_id="M1",
                    start_time=8.0,
                    duration_hours=8.0,
                    description="High-speed spindle bearing seizure during roughing operation"
                )
            )
        ),
        ScenarioPreset(
            id="material-delay-valve",
            name="Inconel Alloy Material Delivery Delay",
            description="Raw material shipment for High-Pressure Valve Manifold (JOB-104) delayed by 6 hours.",
            disruption=DisruptionRequest(
                current_time=6.0,
                material_delay=MaterialDelay(
                    job_id="JOB-104",
                    delay_hours=6.0,
                    material_name="Specialty Inconel 718 Round Billets"
                )
            )
        ),
        ScenarioPreset(
            id="dual-cascade-disruption",
            name="Cascading Compound Disruption",
            description="Simultaneous M1 spindle failure at Hour 8.0 (6h downtime) AND delay on JOB-104 material (+5h).",
            disruption=DisruptionRequest(
                current_time=8.0,
                breakdown=MachineBreakdown(
                    machine_id="M1",
                    start_time=8.0,
                    duration_hours=6.0,
                    description="Hydraulic pressure drop & spindle thermal alarm"
                ),
                material_delay=MaterialDelay(
                    job_id="JOB-104",
                    delay_hours=5.0,
                    material_name="Forged Valve Blanks"
                )
            )
        )
    ]


@router.post("/simulation/scenario/{scenario_id}", response_model=FactoryState)
def apply_preset_scenario(scenario_id: str):
    """Applies a curated disruption scenario preset immediately."""
    scenarios = {s.id: s for s in get_scenarios()}
    if scenario_id not in scenarios:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")

    preset = scenarios[scenario_id]
    sim_manager.reset()
    return sim_manager.disrupt(preset.disruption)
