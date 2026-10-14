import React from 'react';
import { Machine, ScheduleAssignment } from '../types';
import { Server, AlertTriangle, CheckCircle, Activity, Wrench } from 'lucide-react';

interface MachineGridProps {
  machines: Machine[];
  schedule: ScheduleAssignment[];
  currentTime: number;
  makespan?: number;
}

export const MachineGrid: React.FC<MachineGridProps> = ({
  machines,
  schedule,
  currentTime,
  makespan = 16.0,
}) => {
  return (
    <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.85rem',
        }}
      >
        <div className="section-title">
          <Server size={17} style={{ color: 'var(--accent-cyan)' }} />
          <span>Shop Floor Asset Telemetry & Machine Health</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          5 Industrial Production Centers • Discrete Simulation Monitoring
        </div>
      </div>

      <div className="machine-grid-strip">
        {machines.map((m) => {
          const assignedJobs = schedule.filter((a) => a.machine_id === m.id);
          const activeJob = assignedJobs.find(
            (a) => a.start_time <= currentTime && currentTime < a.end_time
          );
          const isDisrupted = m.status === 'disrupted';

          const totalBusyHours = assignedJobs.reduce((sum, a) => sum + a.duration, 0);
          const loadPct = makespan > 0 ? Math.min(100, Math.round((totalBusyHours / makespan) * 100)) : 0;

          return (
            <div
              key={m.id}
              className={`machine-asset-card ${isDisrupted ? 'disrupted' : ''}`}
            >
              {/* Header row: ID, Category, Status */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span
                    className="mono"
                    style={{
                      fontWeight: 700,
                      color: isDisrupted ? '#fb7185' : 'var(--accent-cyan)',
                      fontSize: '0.95rem',
                    }}
                  >
                    {m.id}
                  </span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {m.category}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isDisrupted ? '#fb7185' : '#34d399',
                    letterSpacing: '0.03em',
                  }}
                >
                  {isDisrupted ? (
                    <>
                      <AlertTriangle size={12} />
                      <span>DISRUPTED</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={12} />
                      <span>OPERATIONAL</span>
                    </>
                  )}
                </div>
              </div>

              {/* Machine Name */}
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: isDisrupted ? '#fecdd3' : 'var(--text-primary)',
                }}
                title={m.name}
              >
                {m.name}
              </div>

              {/* Current Active Task */}
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '0.3rem',
                  marginTop: '0.15rem',
                }}
              >
                <span>Current Task:</span>
                <strong
                  className="mono"
                  style={{
                    color: activeJob ? (isDisrupted ? '#fb7185' : '#00f0ff') : 'var(--text-muted)',
                  }}
                >
                  {activeJob ? activeJob.job_id : 'Idle'}
                </strong>
              </div>

              {/* Allocated Queue & Load Bar */}
              <div style={{ marginTop: '0.1rem' }}>
                <div
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Queue Load:</span>
                  <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {assignedJobs.length} Jobs ({totalBusyHours.toFixed(1)}h)
                  </span>
                </div>
                <div className="kpi-bar-track" style={{ height: '3px', marginTop: '3px' }}>
                  <div
                    className="kpi-bar-fill"
                    style={{
                      width: `${loadPct}%`,
                      background: isDisrupted ? '#f43f5e' : 'linear-gradient(90deg, #0284c7, #00f0ff)',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
