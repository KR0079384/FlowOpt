import React from 'react';
import { Clock, CheckCircle2, AlertOctagon, Cpu, Layers, TrendingDown, TrendingUp } from 'lucide-react';
import { ScheduleKPI, KPIComparison } from '../types';

interface KPICardGridProps {
  kpis: ScheduleKPI;
  comparison?: KPIComparison | null;
  status: string;
}

export const KPICardGrid: React.FC<KPICardGridProps> = ({ kpis, comparison, status }) => {
  const isRecovered = status === 'recovered';
  const isDisrupted = status === 'disrupted';

  const makespanDelta = comparison?.makespan_delta ?? 0;
  const tardinessDelta = comparison?.tardiness_delta ?? 0;
  const onTimeDelta = comparison?.on_time_rate_delta ?? 0;
  const utilDelta = comparison?.machine_utilisation_delta ?? 0;

  return (
    <div className="kpi-grid">
      {/* Makespan Card */}
      <div className={`kpi-card ${isDisrupted && makespanDelta > 0 ? 'warning' : isRecovered ? 'success' : ''}`}>
        <div className="kpi-title-row">
          <span>Overall Makespan</span>
          <Clock size={15} style={{ color: 'var(--text-muted)' }} />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{kpis.makespan.toFixed(1)}</span>
          <span className="kpi-unit">hrs</span>
          {comparison && makespanDelta !== 0 && (
            <span className={`kpi-delta ${makespanDelta < 0 ? 'good' : 'bad'}`}>
              {makespanDelta < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
              {makespanDelta > 0 ? `+${makespanDelta.toFixed(1)}h` : `${makespanDelta.toFixed(1)}h`}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          Total factory turnaround horizon
        </div>
      </div>

      {/* On-Time Delivery Rate */}
      <div className={`kpi-card ${kpis.on_time_delivery_rate < 95 ? 'warning' : 'success'}`}>
        <div className="kpi-title-row">
          <span>On-Time Delivery</span>
          <CheckCircle2 size={15} style={{ color: kpis.on_time_delivery_rate >= 95 ? 'var(--status-emerald)' : '#fb7185' }} />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{kpis.on_time_delivery_rate.toFixed(1)}</span>
          <span className="kpi-unit">%</span>
          {comparison && onTimeDelta !== 0 && (
            <span className={`kpi-delta ${onTimeDelta > 0 ? 'good' : 'bad'}`}>
              {onTimeDelta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {onTimeDelta > 0 ? `+${onTimeDelta.toFixed(1)}%` : `${onTimeDelta.toFixed(1)}%`}
            </span>
          )}
        </div>
        <div className="kpi-bar-track">
          <div
            className="kpi-bar-fill"
            style={{
              width: `${Math.min(100, kpis.on_time_delivery_rate)}%`,
              background: kpis.on_time_delivery_rate >= 95 ? 'var(--status-emerald)' : '#f43f5e',
            }}
          />
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          Customer deadline SLA compliance
        </div>
      </div>

      {/* Total Tardiness Card */}
      <div className={`kpi-card ${kpis.total_tardiness > 0 ? 'warning' : 'success'}`}>
        <div className="kpi-title-row">
          <span>Total Tardiness</span>
          <AlertOctagon size={15} style={{ color: kpis.total_tardiness > 0 ? '#fb7185' : 'var(--status-emerald)' }} />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{kpis.total_tardiness.toFixed(1)}</span>
          <span className="kpi-unit">hrs</span>
          {comparison && tardinessDelta !== 0 && (
            <span className={`kpi-delta ${tardinessDelta < 0 ? 'good' : 'bad'}`}>
              {tardinessDelta < 0 ? (
                <>
                  <TrendingDown size={11} /> {Math.abs(tardinessDelta).toFixed(1)}h Saved
                </>
              ) : (
                <>
                  <TrendingUp size={11} /> +{tardinessDelta.toFixed(1)}h Late
                </>
              )}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          Weighted penalty: <strong className="mono" style={{ color: 'var(--text-secondary)' }}>{kpis.weighted_tardiness.toFixed(1)} pt-hrs</strong>
        </div>
      </div>

      {/* Machine Utilisation Card */}
      <div className="kpi-card">
        <div className="kpi-title-row">
          <span>Shop Utilisation</span>
          <Cpu size={15} style={{ color: 'var(--accent-cyan)' }} />
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
        <div className="kpi-bar-track">
          <div
            className="kpi-bar-fill"
            style={{
              width: `${Math.min(100, kpis.machine_utilisation)}%`,
              background: 'linear-gradient(90deg, #0284c7, #00f0ff)',
            }}
          />
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          Active spindle/cutting capacity
        </div>
      </div>

      {/* Production Orders Queue */}
      <div className="kpi-card">
        <div className="kpi-title-row">
          <span>Production Orders</span>
          <Layers size={15} style={{ color: 'var(--text-muted)' }} />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{kpis.total_jobs}</span>
          <span className="kpi-unit">Jobs</span>
        </div>
        <div style={{ display: 'flex', gap: '0.45rem', fontSize: '0.68rem', marginTop: '0.1rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--status-emerald)', fontWeight: 600 }}>✓ {kpis.completed_jobs_count} Done</span>
          <span style={{ color: kpis.delayed_jobs_count > 0 ? '#fb7185' : 'var(--text-muted)', fontWeight: 600 }}>
            ⚠ {kpis.delayed_jobs_count} Late
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>• {kpis.pending_jobs_count} Queued</span>
        </div>
      </div>
    </div>
  );
};
