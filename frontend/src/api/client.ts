import { FactoryState, DisruptionRequest, RecoveryRequest, ScenarioPreset } from '../types';

const API_BASE = '/api';

export async function fetchFactoryState(): Promise<FactoryState> {
  const res = await fetch(`${API_BASE}/factory/state`);
  if (!res.ok) {
    throw new Error(`Failed to fetch factory state: ${res.statusText}`);
  }
  return res.json();
}

export async function resetSimulation(): Promise<FactoryState> {
  const res = await fetch(`${API_BASE}/simulation/reset`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`Failed to reset simulation: ${res.statusText}`);
  }
  return res.json();
}

export async function injectDisruption(payload: DisruptionRequest): Promise<FactoryState> {
  const res = await fetch(`${API_BASE}/simulation/disrupt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to inject disruption: ${res.statusText}`);
  }
  return res.json();
}

export async function optimizeRecovery(payload?: RecoveryRequest): Promise<FactoryState> {
  const res = await fetch(`${API_BASE}/simulation/recover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || { solver_timeout_seconds: 5.0 }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to optimize recovery: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchScenarioPresets(): Promise<ScenarioPreset[]> {
  const res = await fetch(`${API_BASE}/simulation/scenarios`);
  if (!res.ok) {
    throw new Error(`Failed to fetch presets: ${res.statusText}`);
  }
  return res.json();
}

export async function applyScenarioPreset(scenarioId: string): Promise<FactoryState> {
  const res = await fetch(`${API_BASE}/simulation/scenario/${scenarioId}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to apply scenario: ${res.statusText}`);
  }
  return res.json();
}
