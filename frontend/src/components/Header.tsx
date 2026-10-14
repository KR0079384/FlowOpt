import React from 'react';
import { Activity, RotateCcw, Zap, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { SimulationStatus, ScenarioPreset } from '../types';

interface HeaderProps {
  status: SimulationStatus;
  currentTime: number;
  presets: ScenarioPreset[];
  onSelectPreset: (presetId: string) => void;
  onReset: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  currentTime,
  presets,
  onSelectPreset,
  onReset,
  loading,
}) => {
  return (
    <header className="header-wrapper">
      <div className="brand-section">
        <div className="brand-logo-icon">
          <Activity size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="brand-title">FlowOpt</span>
            <span className="brand-tag">Autonomous Recovery</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Industrial Production Scheduling & Disruption Recovery Engine
          </div>
        </div>
      </div>

      <div className="header-controls">
        {/* Status Indicator */}
        <div className={`status-badge ${status}`}>
          {status === 'baseline' && (
            <>
              <ShieldCheck size={14} /> Baseline Schedule Active
            </>
          )}
          {status === 'disrupted' && (
            <>
              <AlertTriangle size={14} /> Disruption Detected
            </>
          )}
          {status === 'recovered' && (
            <>
              <Zap size={14} /> Schedule Recovered (OR-Tools)
            </>
          )}
        </div>

        {/* Current Time Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Clock size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>Clock:</span>
          <strong className="mono" style={{ color: 'var(--text-primary)' }}>
            T = {currentTime.toFixed(1)}h
          </strong>
        </div>

        {/* Scenario Presets Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '190px', padding: '0.45rem 0.65rem' }}
            disabled={loading}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onSelectPreset(e.target.value);
                e.target.value = '';
              }
            }}
          >
            <option value="" disabled>
              ⚡ Quick Scenarios...
            </option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Simulation Button */}
        <button
          className="btn btn-secondary"
          onClick={onReset}
          disabled={loading}
          title="Reset to Baseline Factory State"
        >
          <RotateCcw size={14} />
          Reset Baseline
        </button>
      </div>
    </header>
  );
};
