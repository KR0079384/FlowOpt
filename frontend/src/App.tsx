import React, { useEffect, useState } from 'react';
import {
  FactoryState,
  ScenarioPreset,
  DisruptionRequest,
  RecoveryRequest,
} from './types';
import {
  fetchFactoryState,
  resetSimulation,
  injectDisruption,
  optimizeRecovery,
  fetchScenarioPresets,
  applyScenarioPreset,
} from './api/client';
import { Header } from './components/Header';
import { KPICardGrid } from './components/KPICardGrid';
import { GanttChart } from './components/GanttChart';
import { MachineGrid } from './components/MachineGrid';
import { DisruptionPanel } from './components/DisruptionPanel';
import { RecoveryPanel } from './components/RecoveryPanel';
import { ComparisonTable } from './components/ComparisonTable';
import { JobListView } from './components/JobListView';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [factoryState, setFactoryState] = useState<FactoryState | null>(null);
  const [presets, setPresets] = useState<ScenarioPreset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const [state, presetList] = await Promise.all([
        fetchFactoryState(),
        fetchScenarioPresets(),
      ]);
      setFactoryState(state);
      setPresets(presetList);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to FlowOpt backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = async () => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const state = await resetSimulation();
      setFactoryState(state);
    } catch (err: any) {
      setErrorMessage(err.message || 'Reset failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisruption = async (req: DisruptionRequest) => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const state = await injectDisruption(req);
      setFactoryState(state);
    } catch (err: any) {
      setErrorMessage(err.message || 'Disruption injection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOptimize = async (req?: RecoveryRequest) => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const state = await optimizeRecovery(req);
      setFactoryState(state);
    } catch (err: any) {
      setErrorMessage(err.message || 'Recovery optimization failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectPreset = async (presetId: string) => {
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const state = await applyScenarioPreset(presetId);
      setFactoryState(state);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to apply preset scenario.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !factoryState) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '1rem',
          color: 'var(--text-secondary)',
        }}
      >
        <RefreshCw size={36} className="spin" style={{ color: 'var(--accent-cyan)' }} />
        <div>Connecting to FlowOpt Manufacturing Engine...</div>
      </div>
    );
  }

  if (errorMessage && !factoryState) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <AlertCircle size={48} style={{ color: 'var(--status-rose)' }} />
        <h2 style={{ color: '#fff' }}>Connection Error</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>{errorMessage}</p>
        <button className="btn btn-primary" onClick={loadData}>
          Retry Connection
        </button>
      </div>
    );
  }

  if (!factoryState) return null;

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        status={factoryState.status}
        currentTime={factoryState.current_time}
        presets={presets}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        loading={actionLoading}
      />

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fb7185',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fb7185',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <KPICardGrid
        kpis={factoryState.kpis}
        comparison={factoryState.comparison}
        status={factoryState.status}
      />

      {/* Machine Asset Status Strip */}
      <MachineGrid
        machines={factoryState.machines}
        schedule={factoryState.schedule}
        currentTime={factoryState.current_time}
      />

      {/* Main Two-Column Dashboard Layout (Gantt & Recovery/Disruption Controls) */}
      <div className="dashboard-layout">
        {/* Left Primary Column */}
        <div className="dashboard-main-col">
          {/* Gantt Timeline */}
          <GanttChart
            machines={factoryState.machines}
            schedule={factoryState.schedule}
            currentTime={factoryState.current_time}
            activeDisruptions={factoryState.active_disruptions}
            comparison={factoryState.comparison}
          />

          {/* Before-and-After KPI Comparison Matrix */}
          {factoryState.comparison && (
            <ComparisonTable
              comparison={factoryState.comparison}
              status={factoryState.status}
            />
          )}
        </div>

        {/* Right Sidebar Controls */}
        <div className="dashboard-sidebar-col">
          {/* Recovery Optimizer Action Panel */}
          <RecoveryPanel
            status={factoryState.status}
            onOptimize={() => { handleOptimize(); }}
            loading={actionLoading}
            optimizerInfo={factoryState.optimizer_info}
            comparison={factoryState.comparison}
          />

          {/* Disruption Simulation Controls */}
          <DisruptionPanel
            machines={factoryState.machines}
            jobs={factoryState.jobs}
            currentTime={factoryState.current_time}
            onTriggerDisruption={handleDisruption}
            loading={actionLoading}
          />
        </div>
      </div>

      {/* Production Order Queue & Tracking (Full Width) */}
      <JobListView jobs={factoryState.jobs} schedule={factoryState.schedule} />
    </div>
  );
};

export default App;
