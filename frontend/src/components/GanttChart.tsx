import React, { useState } from 'react';
import { Machine, ScheduleAssignment } from '../types';
import { Calendar, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface GanttChartProps {
  machines: Machine[];
  schedule: ScheduleAssignment[];
  currentTime: number;
  activeDisruptions: any[];
}

export const GanttChart: React.FC<GanttChartProps> = ({
  machines,
  schedule,
  currentTime,
  activeDisruptions,
}) => {
  const [hoveredJob, setHoveredJob] = useState<{
    job: ScheduleAssignment;
    x: number;
    y: number;
  } | null>(null);

  // Determine timeline horizon
  const maxEnd = schedule.reduce((max, a) => Math.max(max, a.end_time), 30);
  const horizon = Math.ceil((maxEnd + 4) / 4) * 4; // Round up to nearest 4 hours

  // Time ticks (every 2 hours)
  const ticks: number[] = [];
  for (let t = 0; t <= horizon; t += 2) {
    ticks.push(t);
  }

  // Group schedule by machine
  const machineJobs: { [mId: string]: ScheduleAssignment[] } = {};
  machines.forEach((m) => {
    machineJobs[m.id] = [];
  });
  schedule.forEach((a) => {
    if (machineJobs[a.machine_id]) {
      machineJobs[a.machine_id].push(a);
    }
  });

  // Find breakdown disruptions
  const breakdowns = activeDisruptions.filter((d) => d.type === 'machine_breakdown');

  const getPriorityClass = (priority: number, isDelayed: boolean, status: string) => {
    if (status === 'interrupted') return 'task-block interrupted';
    if (isDelayed) return 'task-block delayed';
    if (status === 'completed') return 'task-block completed';
    if (priority === 4) return 'task-block p-critical';
    if (priority === 3) return 'task-block p-high';
    if (priority === 2) return 'task-block p-standard';
    return 'task-block p-low';
  };

  return (
    <div className="glass-panel gantt-section">
      <div className="gantt-header-row">
        <div className="section-title">
          <Calendar size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>Production Schedule Timeline (Shop Floor Gantt)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#7c3aed' }}></span>
            Critical (P4)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#0284c7' }}></span>
            High (P3)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#0d9488' }}></span>
            Standard (P2)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#9f1239', border: '1px solid #f43f5e' }}></span>
            Late / Delayed
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 12, height: 10, borderRadius: 2, background: 'repeating-linear-gradient(45deg, #f43f5e, #f43f5e 2px, transparent 2px, transparent 4px)', border: '1px solid #f43f5e' }}></span>
            Breakdown Downtime
          </span>
        </div>
      </div>

      <div className="gantt-scroll-wrapper">
        <div className="timeline-canvas">
          {/* Time axis header */}
          <div className="time-axis">
            {ticks.map((t) => {
              const leftPercent = (t / horizon) * 100;
              return (
                <div key={t} className="time-tick" style={{ left: `${leftPercent}%` }}>
                  <span>{t}h</span>
                </div>
              );
            })}

            {/* Current Time Cursor Line */}
            {currentTime > 0 && currentTime <= horizon && (
              <div
                className="current-time-cursor"
                style={{ left: `calc(140px + ${((currentTime / horizon) * 100) * (1 - 140 / 900)}%)` }}
              >
                <div className="current-time-tag">Now ({currentTime.toFixed(1)}h)</div>
              </div>
            )}
          </div>

          {/* Machine tracks */}
          {machines.map((machine) => {
            const jobs = machineJobs[machine.id] || [];
            const machineBd = breakdowns.find((b) => b.machine_id === machine.id);

            return (
              <div key={machine.id} className="machine-track-row">
                <div className="machine-track-label">
                  <span className="machine-track-id">{machine.id}</span>
                  <span className="machine-track-name" title={machine.name}>
                    {machine.name}
                  </span>
                </div>

                <div className="machine-track-lane">
                  {/* Grid background lines */}
                  {ticks.map((t) => (
                    <div
                      key={t}
                      style={{
                        position: 'absolute',
                        left: `${(t / horizon) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: 'rgba(255, 255, 255, 0.03)',
                        pointerEvents: 'none',
                      }}
                    />
                  ))}

                  {/* Breakdown Hatching overlay */}
                  {machineBd && (
                    <div
                      className="breakdown-hatch-zone"
                      style={{
                        left: `${(machineBd.start_time / horizon) * 100}%`,
                        width: `${(machineBd.duration / horizon) * 100}%`,
                      }}
                      title={`Breakdown: ${machineBd.description} (${machineBd.duration}h downtime)`}
                    >
                      <AlertTriangle size={12} style={{ marginRight: 4 }} />
                      Downtime ({machineBd.duration}h)
                    </div>
                  )}

                  {/* Scheduled Job Blocks */}
                  {jobs.map((assignment) => {
                    const leftPct = (assignment.start_time / horizon) * 100;
                    const widthPct = Math.max(0.5, (assignment.duration / horizon) * 100);
                    const priorityClass = getPriorityClass(
                      assignment.priority,
                      assignment.is_delayed,
                      assignment.status
                    );

                    return (
                      <div
                        key={assignment.job_id}
                        className={priorityClass}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredJob({
                            job: assignment,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10,
                          });
                        }}
                        onMouseLeave={() => setHoveredJob(null)}
                      >
                        <div className="task-id-text">{assignment.job_id}</div>
                        <div className="task-time-text">
                          {assignment.start_time.toFixed(1)}-{assignment.end_time.toFixed(1)}h
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredJob && (
        <div
          className="tooltip-card"
          style={{
            left: Math.min(window.innerWidth - 300, Math.max(10, hoveredJob.x - 140)),
            top: Math.max(10, hoveredJob.y - 120),
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>
              {hoveredJob.job.job_id}
            </strong>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '1px 5px',
                borderRadius: 3,
                background: hoveredJob.job.is_delayed ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)',
                color: hoveredJob.job.is_delayed ? '#fb7185' : '#34d399',
                fontWeight: 600,
              }}
            >
              {hoveredJob.job.status.toUpperCase()}
            </span>
          </div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{hoveredJob.job.job_name}</div>
          <div style={{ color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 8px' }}>
            <span>Machine:</span>
            <strong className="mono" style={{ color: '#fff' }}>{hoveredJob.job.machine_id}</strong>
            <span>Time Window:</span>
            <strong className="mono">
              {hoveredJob.job.start_time.toFixed(1)}h → {hoveredJob.job.end_time.toFixed(1)}h ({hoveredJob.job.duration}h)
            </strong>
            <span>Due Date:</span>
            <strong className="mono">{hoveredJob.job.due_date.toFixed(1)}h</strong>
            {hoveredJob.job.is_delayed && (
              <>
                <span style={{ color: '#fb7185' }}>Tardiness:</span>
                <strong className="mono" style={{ color: '#fb7185' }}>
                  +{hoveredJob.job.delay_hours.toFixed(1)}h late
                </strong>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
