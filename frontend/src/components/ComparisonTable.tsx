import React from 'react';
import { KPIComparison } from '../types';
import { ArrowRight, CheckCircle2, TrendingUp, TrendingDown, GitCompare, Award } from 'lucide-react';

interface ComparisonTableProps {
  comparison?: KPIComparison | null;
  status: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ comparison, status }) => {
  if (!comparison) return null;

  const { baseline_kpis, disrupted_kpis, recovered_kpis, job_shifts, recovery_gain_hours } =
    comparison;

  const isRecovered = status === 'recovered' && recovered_kpis;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="section-title">
          <GitCompare size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>Before-and-After Schedule Optimization Impact</span>
        </div>

        {isRecovered && recovery_gain_hours > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <Award size={15} />
            <span>Optimization Impact: {recovery_gain_hours.toFixed(1)} Tardiness Hours Recovered!</span>
          </div>
        )}
      </div>

      {/* KPI Comparison Matrix */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Performance Indicator</th>
              <th>1. Baseline Plan</th>
              <th>2. Disrupted State</th>
              {isRecovered && <th>3. Recovered (OR-Tools)</th>}
              <th>Net Operational Impact</th>
            </tr>
          </thead>
          <tbody>
            {/* Makespan */}
            <tr>
              <td><strong>Overall Makespan</strong></td>
              <td className="mono">{baseline_kpis.makespan.toFixed(1)} hrs</td>
              <td className="mono" style={{ color: disrupted_kpis.makespan > baseline_kpis.makespan ? '#fb7185' : 'inherit' }}>
                {disrupted_kpis.makespan.toFixed(1)} hrs
              </td>
              {isRecovered && (
                <td className="mono" style={{ color: '#34d399', fontWeight: 700 }}>
                  {recovered_kpis.makespan.toFixed(1)} hrs
                </td>
              )}
              <td>
                {isRecovered ? (
                  <span className={`kpi-delta ${recovered_kpis.makespan <= disrupted_kpis.makespan ? 'good' : 'bad'}`}>
                    {recovered_kpis.makespan - disrupted_kpis.makespan <= 0 ? (
                      <>
                        <TrendingDown size={12} /> {(recovered_kpis.makespan - disrupted_kpis.makespan).toFixed(1)}h reduction
                      </>
                    ) : (
                      <>+{(recovered_kpis.makespan - disrupted_kpis.makespan).toFixed(1)}h</>
                    )}
                  </span>
                ) : (
                  <span className="kpi-delta bad">
                    <TrendingUp size={12} /> +{(disrupted_kpis.makespan - baseline_kpis.makespan).toFixed(1)}h delay
                  </span>
                )}
              </td>
            </tr>

            {/* Total Tardiness */}
            <tr>
              <td><strong>Total Tardiness Delay</strong></td>
              <td className="mono">{baseline_kpis.total_tardiness.toFixed(1)} hrs</td>
              <td className="mono" style={{ color: disrupted_kpis.total_tardiness > 0 ? '#fb7185' : 'inherit' }}>
                {disrupted_kpis.total_tardiness.toFixed(1)} hrs
              </td>
              {isRecovered && (
                <td className="mono" style={{ color: '#34d399', fontWeight: 700 }}>
                  {recovered_kpis.total_tardiness.toFixed(1)} hrs
                </td>
              )}
              <td>
                {isRecovered ? (
                  <span className="kpi-delta good">
                    <TrendingDown size={12} /> {(disrupted_kpis.total_tardiness - recovered_kpis.total_tardiness).toFixed(1)}h saved
                  </span>
                ) : (
                  <span className="kpi-delta bad">
                    <TrendingUp size={12} /> +{(disrupted_kpis.total_tardiness - baseline_kpis.total_tardiness).toFixed(1)}h late
                  </span>
                )}
              </td>
            </tr>

            {/* On-Time Delivery Rate */}
            <tr>
              <td><strong>On-Time Delivery Rate</strong></td>
              <td className="mono">{baseline_kpis.on_time_delivery_rate.toFixed(1)}%</td>
              <td className="mono" style={{ color: disrupted_kpis.on_time_delivery_rate < 100 ? '#fb7185' : 'inherit' }}>
                {disrupted_kpis.on_time_delivery_rate.toFixed(1)}%
              </td>
              {isRecovered && (
                <td className="mono" style={{ color: '#34d399', fontWeight: 700 }}>
                  {recovered_kpis.on_time_delivery_rate.toFixed(1)}%
                </td>
              )}
              <td>
                {isRecovered ? (
                  <span className={`kpi-delta ${recovered_kpis.on_time_delivery_rate >= disrupted_kpis.on_time_delivery_rate ? 'good' : 'bad'}`}>
                    <TrendingUp size={12} /> +{(recovered_kpis.on_time_delivery_rate - disrupted_kpis.on_time_delivery_rate).toFixed(1)}% SLA gain
                  </span>
                ) : (
                  <span className="kpi-delta bad">
                    {(disrupted_kpis.on_time_delivery_rate - baseline_kpis.on_time_delivery_rate).toFixed(1)}% SLA drop
                  </span>
                )}
              </td>
            </tr>

            {/* Machine Utilisation */}
            <tr>
              <td><strong>Mean Machine Utilisation</strong></td>
              <td className="mono">{baseline_kpis.machine_utilisation.toFixed(1)}%</td>
              <td className="mono">{disrupted_kpis.machine_utilisation.toFixed(1)}%</td>
              {isRecovered && (
                <td className="mono" style={{ color: '#00f0ff', fontWeight: 700 }}>
                  {recovered_kpis.machine_utilisation.toFixed(1)}%
                </td>
              )}
              <td>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {isRecovered
                    ? `${(recovered_kpis.machine_utilisation - disrupted_kpis.machine_utilisation).toFixed(1)}% shift`
                    : `${(disrupted_kpis.machine_utilisation - baseline_kpis.machine_utilisation).toFixed(1)}% shift`}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detailed Job Shift Breakdown (When recovered) */}
      {isRecovered && job_shifts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Job Rerouting & Timeline Rescheduling Adjustments ({job_shifts.length} Operations Evaluated)
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Code</th>
                  <th>Manufactured Component</th>
                  <th>Machine Routing</th>
                  <th>Start Window</th>
                  <th>Completion Window</th>
                  <th>Tardiness Change</th>
                  <th>Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {job_shifts.map((s) => (
                  <tr key={s.job_id}>
                    <td>
                      <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>
                        {s.job_id}
                      </strong>
                    </td>
                    <td>{s.job_name}</td>
                    <td>
                      {s.machine_from !== s.machine_to ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#60a5fa' }}>
                          <strong className="mono">{s.machine_from}</strong>
                          <ArrowRight size={12} />
                          <strong className="mono">{s.machine_to}</strong>
                        </span>
                      ) : (
                        <span className="mono" style={{ color: 'var(--text-muted)' }}>
                          {s.machine_to} (Retained)
                        </span>
                      )}
                    </td>
                    <td className="mono">
                      {s.start_before.toFixed(1)}h → <strong>{s.start_after.toFixed(1)}h</strong>
                    </td>
                    <td className="mono">
                      {s.end_before.toFixed(1)}h → <strong>{s.end_after.toFixed(1)}h</strong>
                    </td>
                    <td>
                      {s.tardiness_before > 0 ? (
                        <span className="mono" style={{ color: s.tardiness_after < s.tardiness_before ? '#34d399' : '#fb7185' }}>
                          {s.tardiness_before.toFixed(1)}h → {s.tardiness_after.toFixed(1)}h
                          {s.tardiness_after < s.tardiness_before && ` (-${(s.tardiness_before - s.tardiness_after).toFixed(1)}h)`}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0.0h (On-Time)</span>
                      )}
                    </td>
                    <td>
                      <span className={`pill pill-${s.status_change}`}>
                        {s.status_change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
