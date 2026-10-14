# Frontend Components Context (`frontend/src/components/components.md`)

## A. Directory Purpose
`frontend/src/components` contains modular React presentation and interaction components for the FlowOpt industrial operations simulator.

## B. File Index
- `frontend/src/components/components.md`: This context documentation file.
- `frontend/src/components/Header.tsx`: Factory header, live simulation clock, status badge, scenario presets, and reset trigger.
- `frontend/src/components/KPICardGrid.tsx`: 5-column responsive production telemetry cards (Makespan, On-time Rate, Total Tardiness, Machine Utilisation, Job Queue status) with mini progress bars and delta indicators.
- `frontend/src/components/MachineGrid.tsx`: 5-column horizontal shop-floor asset telemetry strip above the main layout with queue load indicators, current task, efficiency, and status badges.
- `frontend/src/components/GanttChart.tsx`: High-precision interactive Gantt timeline with adaptive width-tier typography (wide, medium, narrow) preventing block overflow, machine tracks, job allocations, breakdown intervals, current time cursor, and post-recovery rerouted job indicators with machine reassignment tags.
- `frontend/src/components/DisruptionPanel.tsx`: Interactive control panel to configure and trigger machine breakdowns and material delivery delays.
- `frontend/src/components/RecoveryPanel.tsx`: Prominent optimization trigger invoking Google OR-Tools CP-SAT, pulsing disruption CTA, post-recovery impact metrics summary card, and solver runtime metrics.
- `frontend/src/components/ComparisonTable.tsx`: Before-and-After delta comparison table, recovery gain highlights, and naturally scrolling job-by-job shift analysis without nested scrollbar traps.
- `frontend/src/components/JobListView.tsx`: Full-width manufacturing order queue with customer, priority, machine, due date, tardiness status, and unconstrained natural table flow across the lower dashboard.

## C. Navigation Guidance
- All components receive typed props from [frontend/src/types/index.ts](file:///k:/Projects/FlowOpt/frontend/src/types/index.ts).
- For overall layout orchestration, see [frontend/src/App.tsx](file:///k:/Projects/FlowOpt/frontend/src/App.tsx).
- For style tokens and classes, see [frontend/src/index.css](file:///k:/Projects/FlowOpt/frontend/src/index.css).
