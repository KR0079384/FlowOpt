import React from 'react';
import { Machine, ScheduleAssignment } from '../types';
import { Server, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface MachineGridProps {
  machines: Machine[];
  schedule: ScheduleAssignment[];
  currentTime: number;
}

export const MachineGrid: React.FC<MachineGridProps> = ({
  machines,
  schedule,
  currentTime,
}) => {
  return (
    <div className="glass-panel">
      <div className="section-title" style={{ marginBottom: '1rem' }}>
        <Server size={18} style={{ color: 'var(--accent-cyan)' }} />
        <span>Machine Telemetry & Asset Health</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem',
        }}
      >
        {machines.map((m) => {
          const assignedJobs = schedule.filter((a) => a.machine_id === m.id);
          const activeJob = assignedJobs.find(
            (a) => a.start_time <= currentTime && currentTime < a.end_time
          );
          const isDisrupted = m.status === 'disrupted';

          return (
            <div
              key={m.id}
              style={{
                background: isDisrupted
                  ? 'rgba(244, 63, 94, 0.1)'
                  : 'rgba(10, 13, 20, 0.6)',
                border: `1px solid ${
                  isDisrupted ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)'
                }`,
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                      fontSize: '0.65rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '1px 6px',
                      borderRadius: '4px',
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
                    gap: '0.3rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: isDisrupted ? '#fb7185' : '#34d399',
                  }}
                >
                  {isDisrupted ? (
                    <>
                      <AlertTriangle size={12} /> DISRUPTED
                    </>
                  ) : (
                    <>
                      <CheckCircle size={12} /> OPERATIONAL
                    </>
                  )}
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={m.name}
              >
                {m.name}
              </div>

              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '0.35rem',
                  marginTop: '0.2rem',
                }}
              >
                <span>Current Task:</span>
                <strong className="mono" style={{ color: activeJob ? '#00f0ff' : 'var(--text-muted)' }}>
                  {activeJob ? activeJob.job_id : 'Idle'}
                </strong>
              </div>

              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Allocated Queue:</span>
                <strong className="mono" style={{ color: 'var(--text-primary)' }}>
                  {assignedJobs.length} Operations
                </strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
