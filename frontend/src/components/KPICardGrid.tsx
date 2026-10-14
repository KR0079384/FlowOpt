import React from 'react';
import { Clock, CheckCircle2, AlertOctagon, Cpu, Layers, TrendingDown, TrendingUp } from 'lucide-react';
import { ScheduleKPI, KPIComparison } from '../types';

interface KPICardGridProps {
  kpis: ScheduleKPI;
  comparison?: KPIComparison | null;
  status: string;
}

export const KPICardGrid: React.FC<KPICardGridProps> = ({ kpis, comparison, status }) => {
  // Compute deltas if comparison is available
  const isRecovered = status === 'recovered';
  const isDisrupted = status === 'disrupted';

  let makespanDelta = comparison?.makespan_delta ?? 0;
  let tardinessDelta = comparison?.tardiness_delta ?? 0;
  let onTimeDelta = comparison?.on_time_rate_delta ?? 0;
  let utilDelta = comparison?.machine_utilisation_delta ?? 0;

  return (
    <div className="kpi-grid">
      {/* Makespan Card */}
      <div className={`kpi-card ${isDisrupted && makespanDelta > 0 ? 'warning' : isRecovered ? 'success' : ''}`}>
        <div className="kpi-title-row">
          <span>Overall Makespan</span>
          <Clock size={16} />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{kpis.makespan.toFixed(1)}</span>
          <span className="kpi-unit">hrs</span>
          {comparison && makespanDelta !== 0 && (
            <span className={`kpi-delta ${makespanDelta < 0 ? 'good' : 'bad'}`}>
              {makespanDelta < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {makespanDelta > 0 ? `+${makespanDelta.toFixed(1)}h` : `${makespanDelta.toFixed(1)}h`}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Total factory turnaround horizon
        </div>
      </div>

      {/* On-Time Delivery Rate */}
      <div className={`kpi-card ${kpis.on_time_delivery_rate < 90 ? 'warning' : 'success'}`}>
        <div className="kpi-title-row">
          <span>On-Time Delivery</span>
          <CheckCircle2 size={16} />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{kpis.on_time_delivery_rate.toFixed(1)}</span>
          <span className="kpi-unit">%</span>
          {comparison && onTimeDelta !== 0 && (
            <span className={`kpi-delta ${onTimeDelta > 0 ? 'good' : 'bad'}`}>
              {onTimeDelta > 0 ? `+${onTimeDelta.toFixed(1)}%` : `${onTimeDelta.toFixed(1)}%`}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Jobs meeting customer deadline
        </div>
      </div>

      {/* Total Tardiness Card */}
      <div className={`kpi-card ${kpis.total_tardiness > 0 ? 'warning' : 'success'}`}>
        <div className="kpi-title-row">
          <span>Total Tardiness</span>
          <AlertOctagon size={16} />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{kpis.total_tardiness.toFixed(1)}</span>
          <span className="kpi-unit">hrs</span>
          {comparison && tardinessDelta !== 0 && (
            <span className={`kpi-delta ${tardinessDelta < 0 ? 'good' : 'bad'}`}>
              {tardinessDelta < 0 ? `${tardinessDelta.toFixed(1)}h (Saved)` : `+${tardinessDelta.toFixed(1)}h`}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Weighted delay: <strong className="mono">{kpis.weighted_tardiness.toFixed(1)} pt-hrs</strong>
        </div>
      </div>

      {/* Machine Utilisation Card */}
      <div className="kpi-card">
        <div className="kpi-title-row">
          <span>Shop Utilisation</span>
          <Cpu size={16} />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{kpis.machine_utilisation.toFixed(1)}</span>
          <span className="kpi-unit">%</span>
          {comparison && utilDelta !== 0 && (
            <span className={`kpi-delta ${utilDelta > 0 ? 'good' : 'bad'}`}>
              {utilDelta > 0 ? `+${utilDelta.toFixed(1)}%` : `${utilDelta.toFixed(1)}%`}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Active spindle/cutting capacity
        </div>
      </div>

      {/* Active Jobs Queue */}
      <div className="kpi-card">
        <div className="kpi-title-row">
          <span>Production Orders</span>
          <Layers size={16} />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{kpis.total_jobs}</span>
          <span className="kpi-unit">Jobs</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem' }}>
          <span style={{ color: 'var(--status-emerald)' }}>✓ {kpis.completed_jobs_count} Done</span>
          <span style={{ color: kpis.delayed_jobs_count > 0 ? 'var(--status-rose)' : 'var(--text-muted)' }}>
            ⚠ {kpis.delayed_jobs_count} Late
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>• {kpis.pending_jobs_count} Queued</span>
        </div>
      </div>
    </div>
  );
};
