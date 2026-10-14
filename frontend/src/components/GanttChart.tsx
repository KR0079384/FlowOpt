import React, { useState } from 'react';
import { Machine, ScheduleAssignment, KPIComparison, JobDiff } from '../types';
import { Calendar, AlertTriangle, ArrowRight, CheckCircle2, RotateCw, Clock } from 'lucide-react';

interface GanttChartProps {
  machines: Machine[];
  schedule: ScheduleAssignment[];
  currentTime: number;
  activeDisruptions: any[];
  comparison?: KPIComparison | null;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  machines,
  schedule,
  currentTime,
  activeDisruptions,
  comparison,
}) => {
  const [hoveredJob, setHoveredJob] = useState<{
    job: ScheduleAssignment;
    shift?: JobDiff;
    x: number;
    y: number;
  } | null>(null);

  // Determine timeline horizon (round up to nearest 4h milestone)
  const maxEnd = schedule.reduce((max, a) => Math.max(max, a.end_time), 30);
  const horizon = Math.max(28, Math.ceil((maxEnd + 3) / 4) * 4);

  // Time ticks (every 2 hours, with major milestones every 4h)
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

  // Map job shifts from comparison if available
  const shiftMap: { [jobId: string]: JobDiff } = {};
  if (comparison && comparison.job_shifts) {
    comparison.job_shifts.forEach((s) => {
      shiftMap[s.job_id] = s;
    });
  }

  // Active breakdown disruptions
  const breakdowns = activeDisruptions.filter((d) => d.type === 'machine_breakdown');

  const getJobBlockClasses = (
    priority: number,
    isDelayed: boolean,
    status: string,
    isRerouted: boolean,
    widthTier: 'wide' | 'medium' | 'narrow'
  ) => {
    const classes = ['task-block', `task-block-${widthTier}`];
    if (status === 'interrupted') classes.push('interrupted');
    else if (isDelayed) classes.push('delayed');
    else if (status === 'completed') classes.push('completed');
    else if (priority === 4) classes.push('p-critical');
    else if (priority === 3) classes.push('p-high');
    else if (priority === 2) classes.push('p-standard');
    else classes.push('p-low');

    if (isRerouted) classes.push('rerouted');
    return classes.join(' ');
  };

  return (
    <div className="glass-panel gantt-section">
      {/* Header and Legend */}
      <div className="gantt-header-row">
        <div className="section-title">
          <Calendar size={17} style={{ color: 'var(--accent-cyan)' }} />
          <span>Production Schedule Timeline (Shop Floor Gantt)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.72rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: '#7c3aed' }}></span>
            Critical (P4)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: '#0284c7' }}></span>
            High (P3)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: '#0d9488' }}></span>
            Standard (P2)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: '#9f1239', border: '1px solid #f43f5e' }}></span>
            Delayed / Late
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, border: '1.5px solid #00f0ff', background: '#0284c7' }}></span>
            Rerouted
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span
              style={{
                width: 12,
                height: 9,
                borderRadius: 2,
                background: 'repeating-linear-gradient(45deg, #f43f5e, #f43f5e 2px, transparent 2px, transparent 4px)',
                border: '1px solid #f43f5e',
              }}
            ></span>
            Downtime
          </span>
        </div>
      </div>

      {/* Timeline Scrollable Track */}
      <div className="gantt-scroll-wrapper">
        <div className="timeline-canvas">
          {/* Time axis header */}
          <div className="time-axis">
            {ticks.map((t) => {
              const leftPercent = (t / horizon) * 100;
              const isMajor = t % 4 === 0;
              return (
                <div
                  key={t}
                  className={`time-tick ${isMajor ? 'major' : ''}`}
                  style={{ left: `${leftPercent}%` }}
                >
                  <span>{t}h</span>
                </div>
              );
            })}

            {/* Current Time Cursor Line */}
            {currentTime > 0 && currentTime <= horizon && (
              <div
                className="current-time-cursor"
                style={{
                  left: `calc(170px + ${(currentTime / horizon) * 100}% * (1 - 170px / 100%))`,
                }}
              >
                <div className="current-time-tag">
                  <Clock size={10} style={{ display: 'inline', marginRight: 2 }} />
                  T = {currentTime.toFixed(1)}h
                </div>
              </div>
            )}
          </div>

          {/* Machine tracks */}
          {machines.map((machine) => {
            const jobs = machineJobs[machine.id] || [];
            const machineBd = breakdowns.find((b) => b.machine_id === machine.id);
            const isDisrupted = machine.status === 'disrupted';

            return (
              <div key={machine.id} className="machine-track-row">
                {/* Machine Label Column (170px) */}
                <div className="machine-track-label">
                  <div className="machine-track-header">
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: isDisrupted ? '#f43f5e' : '#10b981',
                        boxShadow: isDisrupted ? '0 0 6px #f43f5e' : '0 0 6px #10b981',
                      }}
                    />
                    <span className="machine-track-id">{machine.id}</span>
                    <span className="machine-track-cat">{machine.category}</span>
                  </div>
                  <span className="machine-track-name" title={machine.name}>
                    {machine.name}
                  </span>
                </div>

                {/* Machine Track Lane */}
                <div className="machine-track-lane">
                  {/* Grid background guide lines */}
                  {ticks.map((t) => (
                    <div
                      key={t}
                      style={{
                        position: 'absolute',
                        left: `${(t / horizon) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: t % 4 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
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
                      title={`Breakdown: ${machineBd.description} (${machineBd.duration}h downtime window)`}
                    >
                      <AlertTriangle size={13} style={{ marginRight: 5, flexShrink: 0 }} />
                      <span>Downtime [{machineBd.start_time.toFixed(1)}h - {(machineBd.start_time + machineBd.duration).toFixed(1)}h]</span>
                    </div>
                  )}

                  {/* Scheduled Job Blocks */}
                  {jobs.map((assignment) => {
                    const leftPct = (assignment.start_time / horizon) * 100;
                    const widthPct = Math.max(0.6, (assignment.duration / horizon) * 100);
                    const shift = shiftMap[assignment.job_id];
                    const isRerouted = Boolean(shift && shift.machine_from !== shift.machine_to);

                    const widthTier: 'wide' | 'medium' | 'narrow' =
                      widthPct >= 11.5 ? 'wide' : widthPct >= 6.8 ? 'medium' : 'narrow';

                    const blockClasses = getJobBlockClasses(
                      assignment.priority,
                      assignment.is_delayed,
                      assignment.status,
                      isRerouted,
                      widthTier
                    );

                    return (
                      <div
                        key={assignment.job_id}
                        className={blockClasses}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredJob({
                            job: assignment,
                            shift,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setHoveredJob(null)}
                      >
                        <div className="task-id-text">
                          {widthTier === 'narrow' ? (
                            <span title={assignment.job_id}>{assignment.job_id.replace('JOB-', '#')}</span>
                          ) : (
                            <span>{assignment.job_id}</span>
                          )}

                          {isRerouted && (
                            widthTier === 'wide' ? (
                              <span className="task-reroute-tag" title={`Rerouted from ${shift?.machine_from} to ${shift?.machine_to}`}>
                                {shift?.machine_from}→{shift?.machine_to}
                              </span>
                            ) : widthTier === 'medium' ? (
                              <span className="task-reroute-tag" title={`Rerouted from ${shift?.machine_from} to ${shift?.machine_to}`}>
                                →{shift?.machine_to}
                              </span>
                            ) : (
                              <span className="task-reroute-dot" title={`Rerouted from ${shift?.machine_from} to ${shift?.machine_to}`}>
                                ●
                              </span>
                            )
                          )}
                        </div>

                        {widthTier === 'wide' && (
                          <div className="task-time-text">
                            {assignment.start_time.toFixed(1)}-{assignment.end_time.toFixed(1)}h ({assignment.duration}h)
                          </div>
                        )}

                        {widthTier === 'medium' && (
                          <div className="task-time-text">
                            {assignment.duration}h
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Precision Telemetry Tooltip */}
      {hoveredJob && (
        <div
          className="tooltip-card"
          style={{
            left: Math.min(window.innerWidth - 330, Math.max(10, hoveredJob.x - 160)),
            top: Math.max(10, hoveredJob.y - 140),
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <strong className="mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                {hoveredJob.job.job_id}
              </strong>
              <span
                style={{
                  fontSize: '0.62rem',
                  padding: '1px 5px',
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.08)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                P{hoveredJob.job.priority}
              </span>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '1px 6px',
                borderRadius: 3,
                background: hoveredJob.job.is_delayed ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)',
                color: hoveredJob.job.is_delayed ? '#fb7185' : '#34d399',
                fontWeight: 700,
              }}
            >
              {hoveredJob.job.status.toUpperCase()}
            </span>
          </div>

          <div style={{ fontWeight: 600, marginBottom: 5, fontSize: '0.78rem' }}>
            {hoveredJob.job.job_name}
          </div>

          <div
            style={{
              color: 'var(--text-secondary)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '2px 8px',
              fontSize: '0.72rem',
            }}
          >
            <span>Assigned Asset:</span>
            <strong className="mono" style={{ color: '#fff' }}>
              {hoveredJob.job.machine_id}
            </strong>

            <span>Allocated Window:</span>
            <strong className="mono">
              {hoveredJob.job.start_time.toFixed(1)}h → {hoveredJob.job.end_time.toFixed(1)}h ({hoveredJob.job.duration}h)
            </strong>

            <span>Delivery Due Date:</span>
            <strong className="mono">{hoveredJob.job.due_date.toFixed(1)}h</strong>

            {hoveredJob.job.is_delayed && (
              <>
                <span style={{ color: '#fb7185' }}>Tardiness Penalty:</span>
                <strong className="mono" style={{ color: '#fb7185' }}>
                  +{hoveredJob.job.delay_hours.toFixed(1)}h Late
                </strong>
              </>
            )}

            {/* Shift notes */}
            {hoveredJob.shift && hoveredJob.shift.machine_from !== hoveredJob.shift.machine_to && (
              <>
                <span style={{ color: 'var(--accent-cyan)' }}>Reroute Detail:</span>
                <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>
                  Moved from {hoveredJob.shift.machine_from} → {hoveredJob.shift.machine_to}
                </strong>
              </>
            )}

            {hoveredJob.shift && hoveredJob.shift.status_change === 'recovered' && (
              <>
                <span style={{ color: '#34d399' }}>Recovery Gain:</span>
                <strong className="mono" style={{ color: '#34d399' }}>
                  Tardiness reduced by {(hoveredJob.shift.tardiness_before - hoveredJob.shift.tardiness_after).toFixed(1)}h
                </strong>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
