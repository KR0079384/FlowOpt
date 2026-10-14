import React, { useState } from 'react';
import { Job, ScheduleAssignment } from '../types';
import { ListOrdered, Search, Filter } from 'lucide-react';

interface JobListViewProps {
  jobs: Job[];
  schedule: ScheduleAssignment[];
}

export const JobListView: React.FC<JobListViewProps> = ({ jobs, schedule }) => {
  const [filter, setFilter] = useState<'all' | 'delayed' | 'completed' | 'pending'>('all');
  const [search, setSearch] = useState('');

  const jobMap = { ...jobs.reduce((acc, j) => ({ ...acc, [j.id]: j }), {} as { [id: string]: Job }) };

  const filteredSchedule = schedule.filter((a) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'delayed' && a.is_delayed) ||
      (filter === 'completed' && a.status === 'completed') ||
      (filter === 'pending' && a.status === 'pending');

    const matchesSearch =
      search === '' ||
      a.job_id.toLowerCase().includes(search.toLowerCase()) ||
      a.job_name.toLowerCase().includes(search.toLowerCase()) ||
      a.machine_id.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="glass-panel">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div className="section-title">
          <ListOrdered size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>Production Order Queue & Due Date Tracking ({schedule.length} Jobs)</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Filter by job/machine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '28px', width: '180px', height: '32px', fontSize: '0.75rem' }}
            />
          </div>

          {/* Quick status filters */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 2, borderRadius: 6 }}>
            {(['all', 'delayed', 'completed', 'pending'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  borderRadius: 4,
                  border: 'none',
                  background: filter === mode ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: filter === mode ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Component & Customer</th>
              <th>Machine</th>
              <th>Schedule Window</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Tardiness</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedule.map((a) => {
              const meta = jobMap[a.job_id];

              return (
                <tr key={a.job_id}>
                  <td>
                    <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>
                      {a.job_id}
                    </strong>
                  </td>
                  <td>
                    <div><strong>{a.job_name}</strong></div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {meta?.customer} • {meta?.part_number}
                    </div>
                  </td>
                  <td>
                    <span className="mono" style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                      {a.machine_id}
                    </span>
                  </td>
                  <td className="mono">
                    {a.start_time.toFixed(1)}h → {a.end_time.toFixed(1)}h ({a.duration}h)
                  </td>
                  <td className="mono">{a.due_date.toFixed(1)}h</td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background:
                          a.priority === 4
                            ? 'rgba(124, 58, 237, 0.3)'
                            : a.priority === 3
                            ? 'rgba(2, 132, 199, 0.3)'
                            : 'rgba(255,255,255,0.08)',
                        color:
                          a.priority === 4
                            ? '#c4b5fd'
                            : a.priority === 3
                            ? '#7dd3fc'
                            : 'var(--text-secondary)',
                      }}
                    >
                      P{a.priority}
                    </span>
                  </td>
                  <td>
                    <span
                      className="pill"
                      style={{
                        background:
                          a.status === 'completed'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : a.status === 'delayed'
                            ? 'rgba(244, 63, 94, 0.2)'
                            : a.status === 'interrupted'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(255, 255, 255, 0.08)',
                        color:
                          a.status === 'completed'
                            ? '#34d399'
                            : a.status === 'delayed'
                            ? '#fb7185'
                            : a.status === 'interrupted'
                            ? '#fbbf24'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>
                    {a.is_delayed ? (
                      <span className="mono" style={{ color: '#fb7185', fontWeight: 700 }}>
                        +{a.delay_hours.toFixed(1)}h Late
                      </span>
                    ) : (
                      <span className="mono" style={{ color: '#34d399' }}>
                        On-Time
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
