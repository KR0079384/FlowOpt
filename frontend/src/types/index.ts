export type MachineStatus = 'operational' | 'disrupted' | 'maintenance' | 'idle';

export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'delayed' | 'interrupted';

export type SimulationStatus = 'baseline' | 'disrupted' | 'recovered';

export interface Machine {
  id: string;
  name: string;
  category: string;
  status: MachineStatus;
  efficiency: number;
  hourly_rate: number;
}

export interface Job {
  id: string;
  name: string;
  part_number: string;
  customer: string;
  compatible_machines: string[];
  preferred_machine: string;
  duration_hours: number;
  priority: number;
  due_date: number;
  release_time: number;
  predecessor_id?: string | null;
}

export interface ScheduleAssignment {
  job_id: string;
  job_name: string;
  machine_id: string;
  start_time: number;
  end_time: number;
  duration: number;
  status: JobStatus;
  due_date: number;
  priority: number;
  is_delayed: boolean;
  delay_hours: number;
}

export interface ScheduleKPI {
  makespan: number;
  total_tardiness: number;
  weighted_tardiness: number;
  on_time_delivery_rate: number;
  machine_utilisation: number;
  total_jobs: number;
  completed_jobs_count: number;
  pending_jobs_count: number;
  delayed_jobs_count: number;
}

export interface JobDiff {
  job_id: string;
  job_name: string;
  priority: number;
  due_date: number;
  machine_from: string;
  machine_to: string;
  start_before: number;
  start_after: number;
  end_before: number;
  end_after: number;
  shift_hours: number;
  tardiness_before: number;
  tardiness_after: number;
  status_change: 'recovered' | 'delayed' | 'reassigned' | 'unchanged';
}

export interface KPIComparison {
  baseline_kpis: ScheduleKPI;
  disrupted_kpis: ScheduleKPI;
  recovered_kpis?: ScheduleKPI | null;
  makespan_delta: number;
  tardiness_delta: number;
  on_time_rate_delta: number;
  machine_utilisation_delta: number;
  recovery_gain_hours: number;
  job_shifts: JobDiff[];
}

export interface MachineBreakdown {
  machine_id: string;
  start_time: number;
  duration_hours: number;
  description: string;
}

export interface MaterialDelay {
  job_id: string;
  delay_hours: number;
  material_name: string;
}

export interface DisruptionRequest {
  current_time: number;
  breakdown?: MachineBreakdown | null;
  material_delay?: MaterialDelay | null;
}

export interface RecoveryRequest {
  solver_timeout_seconds: number;
  preserve_in_progress?: boolean;
  weight_tardiness?: number;
  weight_makespan?: number;
  weight_stability?: number;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  disruption: DisruptionRequest;
}

export interface FactoryState {
  simulation_name: string;
  current_time: number;
  status: SimulationStatus;
  machines: Machine[];
  jobs: Job[];
  schedule: ScheduleAssignment[];
  kpis: ScheduleKPI;
  active_disruptions: any[];
  comparison?: KPIComparison | null;
  optimizer_info?: {
    algorithm: string;
    status: string;
    objective_value?: number;
    solve_time_ms: number;
    num_jobs_recovered: number;
    is_valid: boolean;
    validation_errors?: string[];
    reassignments_count?: number;
  } | null;
}
