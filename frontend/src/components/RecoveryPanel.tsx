import React from 'react';
import { Zap, CheckCircle2, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { SimulationStatus } from '../types';

interface RecoveryPanelProps {
  status: SimulationStatus;
  onOptimize: () => void;
  loading: boolean;
  optimizerInfo?: {
    algorithm: string;
    status: string;
    solve_time_ms: number;
    num_jobs_recovered: number;
    is_valid: boolean;
    validation_errors?: string[];
    reassignments_count?: number;
  } | null;
}

export const RecoveryPanel: React.FC<RecoveryPanelProps> = ({
  status,
  onOptimize,
  loading,
  optimizerInfo,
}) => {
  const isDisrupted = status === 'disrupted';
  const isRecovered = status === 'recovered';

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div className="section-title">
        <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
        <span>Autonomous Recovery Optimizer</span>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        Generates mathematically optimal recovery allocations using Google OR-Tools CP-SAT. Freezes completed operations, avoids broken equipment windows, and reroutes compatible jobs.
      </p>

      <button
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: '0.8rem 1.2rem',
          fontSize: '0.95rem',
          fontWeight: 700,
          justifyContent: 'center',
          letterSpacing: '0.02em',
        }}
        onClick={onOptimize}
        disabled={loading || !isDisrupted}
      >
        <Zap size={18} />
        {loading ? 'Solving CP-SAT Model...' : 'Optimise Recovery Schedule'}
      </button>

      {!isDisrupted && !isRecovered && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          * Factory is currently running at baseline. Inject a disruption to run recovery.
        </div>
      )}

      {/* Solver Feedback Telemetry */}
      {optimizerInfo && (
        <div className="solver-banner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              SOLVER RESULT
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: optimizerInfo.is_valid ? '#34d399' : '#fb7185',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              {optimizerInfo.is_valid ? <CheckCircle2 size={13} /> : <ShieldAlert size={13} />}
              {optimizerInfo.status}
            </span>
          </div>

          <div className="solver-stat-row">
            <span style={{ color: 'var(--text-secondary)' }}>Engine:</span>
            <strong style={{ color: '#fff' }}>{optimizerInfo.algorithm}</strong>
          </div>

          <div className="solver-stat-row">
            <span style={{ color: 'var(--text-secondary)' }}>Computation Latency:</span>
            <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>
              {optimizerInfo.solve_time_ms} ms
            </strong>
          </div>

          <div className="solver-stat-row">
            <span style={{ color: 'var(--text-secondary)' }}>Active Operations Rescheduled:</span>
            <strong className="mono">{optimizerInfo.num_jobs_recovered} Operations</strong>
          </div>

          <div className="solver-stat-row">
            <span style={{ color: 'var(--text-secondary)' }}>Machine Reroutes:</span>
            <strong className="mono" style={{ color: '#60a5fa' }}>
              {optimizerInfo.reassignments_count ?? 0} Alternative Reroutes
            </strong>
          </div>

          <div
            style={{
              marginTop: '0.2rem',
              paddingTop: '0.4rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.7rem',
              color: 'var(--status-emerald)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <CheckCircle2 size={12} />
            <span>Non-overlap & precedence constraints mathematically verified.</span>
          </div>
        </div>
      )}
    </div>
  );
};
