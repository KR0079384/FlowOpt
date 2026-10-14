from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class MachineStatus(str, Enum):
    OPERATIONAL = "operational"
    DISRUPTED = "disrupted"
    MAINTENANCE = "maintenance"
    IDLE = "idle"


class JobStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELAYED = "delayed"
    INTERRUPTED = "interrupted"


class SimulationStatus(str, Enum):
    BASELINE = "baseline"
    DISRUPTED = "disrupted"
    RECOVERED = "recovered"


class Machine(BaseModel):
    id: str = Field(..., description="Unique machine identifier, e.g. M1")
    name: str = Field(..., description="Industrial equipment name")
    category: str = Field(..., description="Machine type/process (Milling, Lathe, Laser, etc.)")
    status: MachineStatus = Field(default=MachineStatus.OPERATIONAL)
    efficiency: float = Field(default=1.0, ge=0.5, le=2.0, description="Processing efficiency rate multiplier")
    hourly_rate: float = Field(default=120.0, description="Operating cost per hour in USD")


class Job(BaseModel):
    id: str = Field(..., description="Unique job ID, e.g. JOB-101")
    name: str = Field(..., description="Manufactured component description")
    part_number: str = Field(default="PART-001")
    customer: str = Field(default="AeroSpace Dynamics")
    compatible_machines: List[str] = Field(..., description="List of machine IDs capable of running this job")
    preferred_machine: str = Field(..., description="Primary designated machine ID")
    duration_hours: float = Field(..., gt=0, description="Nominal processing hours required")
    priority: int = Field(default=2, ge=1, le=4, description="1=Low, 2=Standard, 3=High, 4=Critical")
    due_date: float = Field(..., ge=0, description="Target delivery deadline in simulation hours")
    release_time: float = Field(default=0.0, ge=0, description="Earliest material ready time in simulation hours")
    predecessor_id: Optional[str] = Field(default=None, description="Job ID that must complete before this job can start")


class ScheduleAssignment(BaseModel):
    job_id: str
    job_name: str
    machine_id: str
    start_time: float
    end_time: float
    duration: float
    status: JobStatus = JobStatus.PENDING
    due_date: float
    priority: int
    is_delayed: bool = False
    delay_hours: float = 0.0


class MachineBreakdown(BaseModel):
    machine_id: str = Field(..., description="Machine undergoing failure")
    start_time: float = Field(..., ge=0, description="Simulation hour at which breakdown occurs")
    duration_hours: float = Field(..., gt=0, description="Downtime duration until repairs complete")
    description: str = Field(default="Mechanical spindle bearing failure")


class MaterialDelay(BaseModel):
    job_id: str = Field(..., description="Job waiting on delayed raw materials")
    delay_hours: float = Field(..., gt=0, description="Additional delay in material arrival")
    material_name: str = Field(default="High-grade Inconel billets")


class DisruptionRequest(BaseModel):
    current_time: float = Field(default=8.0, ge=0, description="Factory clock time when disruption is reported")
    breakdown: Optional[MachineBreakdown] = None
    material_delay: Optional[MaterialDelay] = None


class ScheduleKPI(BaseModel):
    makespan: float = Field(..., description="Maximum completion time across all jobs in hours")
    total_tardiness: float = Field(..., description="Sum of max(0, completion - due_date) across jobs")
    weighted_tardiness: float = Field(..., description="Sum of priority * tardiness")
    on_time_delivery_rate: float = Field(..., description="Percentage of jobs completed on or before due date")
    machine_utilisation: float = Field(..., description="Average machine busy time percentage")
    total_jobs: int = 0
    completed_jobs_count: int = 0
    pending_jobs_count: int = 0
    delayed_jobs_count: int = 0


class JobDiff(BaseModel):
    job_id: str
    job_name: str
    priority: int
    due_date: float
    machine_from: str
    machine_to: str
    start_before: float
    start_after: float
    end_before: float
    end_after: float
    shift_hours: float
    tardiness_before: float
    tardiness_after: float
    status_change: str = Field(..., description="recovered, delayed, reassigned, or unchanged")


class KPIComparison(BaseModel):
    baseline_kpis: ScheduleKPI
    disrupted_kpis: ScheduleKPI
    recovered_kpis: Optional[ScheduleKPI] = None
    makespan_delta: float = 0.0
    tardiness_delta: float = 0.0
    on_time_rate_delta: float = 0.0
    machine_utilisation_delta: float = 0.0
    recovery_gain_hours: float = 0.0
    job_shifts: List[JobDiff] = []


class RecoveryRequest(BaseModel):
    solver_timeout_seconds: float = Field(default=5.0, ge=0.5, le=30.0)
    preserve_in_progress: bool = Field(default=True, description="Keep work already started on non-broken machines")
    weight_tardiness: float = Field(default=10.0, description="Objective weight for tardiness minimization")
    weight_makespan: float = Field(default=1.0, description="Objective weight for makespan minimization")
    weight_stability: float = Field(default=2.0, description="Objective weight penalizing excessive machine reassignments")


class ScenarioPreset(BaseModel):
    id: str
    name: str
    description: str
    disruption: DisruptionRequest


class FactoryState(BaseModel):
    simulation_name: str = "FlowOpt Precision Plant Alpha"
    current_time: float = 0.0
    status: SimulationStatus = SimulationStatus.BASELINE
    machines: List[Machine]
    jobs: List[Job]
    schedule: List[ScheduleAssignment]
    kpis: ScheduleKPI
    active_disruptions: List[Dict[str, Any]] = []
    comparison: Optional[KPIComparison] = None
    optimizer_info: Optional[Dict[str, Any]] = None
