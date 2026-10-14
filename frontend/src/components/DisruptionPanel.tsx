import React, { useState } from 'react';
import { Machine, Job, DisruptionRequest } from '../types';
import { AlertTriangle, Wrench, Package, Play } from 'lucide-react';

interface DisruptionPanelProps {
  machines: Machine[];
  jobs: Job[];
  currentTime: number;
  onTriggerDisruption: (req: DisruptionRequest) => void;
  loading: boolean;
}

export const DisruptionPanel: React.FC<DisruptionPanelProps> = ({
  machines,
  jobs,
  currentTime,
  onTriggerDisruption,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'material'>('breakdown');

  // Breakdown state
  const [selectedMachine, setSelectedMachine] = useState<string>(machines[0]?.id || 'M1');
  const [breakdownStart, setBreakdownStart] = useState<number>(8.0);
  const [breakdownDuration, setBreakdownDuration] = useState<number>(8.0);
  const [breakdownReason, setBreakdownReason] = useState<string>('High-speed spindle bearing seizure');

  // Material delay state
  const [selectedJob, setSelectedJob] = useState<string>(jobs[3]?.id || 'JOB-104');
  const [delayHours, setDelayHours] = useState<number>(6.0);
  const [materialName, setMaterialName] = useState<string>('Specialty Inconel alloy billets');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'breakdown') {
      const payload: DisruptionRequest = {
        current_time: breakdownStart,
        breakdown: {
          machine_id: selectedMachine,
          start_time: breakdownStart,
          duration_hours: breakdownDuration,
          description: breakdownReason,
        },
      };
      onTriggerDisruption(payload);
    } else {
      const payload: DisruptionRequest = {
        current_time: Math.min(6.0, breakdownStart),
        material_delay: {
          job_id: selectedJob,
          delay_hours: delayHours,
          material_name: materialName,
        },
      };
      onTriggerDisruption(payload);
    }
  };

  return (
    <div className="glass-panel">
      <div className="section-title" style={{ marginBottom: '0.85rem' }}>
        <AlertTriangle size={18} style={{ color: 'var(--status-rose)' }} />
        <span>Disruption Injection Simulator</span>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '0.25rem',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('breakdown')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.45rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'breakdown' ? 'var(--status-rose)' : 'transparent',
            color: activeTab === 'breakdown' ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <Wrench size={13} /> Machine Breakdown
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('material')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.45rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'material' ? 'var(--status-amber)' : 'transparent',
            color: activeTab === 'material' ? '#000' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <Package size={13} /> Material Delay
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'breakdown' ? (
          <div>
            <div className="form-group">
              <label className="form-label">Target Asset / Machine</label>
              <select
                className="form-select"
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Breakdown Start (Hour)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="40"
                  step="0.5"
                  value={breakdownStart}
                  onChange={(e) => setBreakdownStart(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Downtime Duration (Hours)</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="30"
                  step="0.5"
                  value={breakdownDuration}
                  onChange={(e) => setBreakdownDuration(parseFloat(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Incident Diagnosis</label>
              <input
                type="text"
                className="form-input"
                value={breakdownReason}
                onChange={(e) => setBreakdownReason(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="form-group">
              <label className="form-label">Delayed Production Job</label>
              <select
                className="form-select"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.id} — {j.name} (Due: {j.due_date}h)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Delay Duration (Hours)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="30"
                step="0.5"
                value={delayHours}
                onChange={(e) => setDelayHours(parseFloat(e.target.value) || 1)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delayed Material / Feedstock</label>
              <input
                type="text"
                className="form-input"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-danger"
          style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
          disabled={loading}
        >
          <Play size={14} /> Trigger Disruption Simulation
        </button>
      </form>
    </div>
  );
};
