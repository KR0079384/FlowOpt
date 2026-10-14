# Frontend Components Context (`frontend/src/components/components.md`)

## A. Directory Purpose
`frontend/src/components` contains modular React presentation and interaction components for the FlowOpt industrial operations simulator.

## B. File Index
- `frontend/src/components/components.md`: This context documentation file.
- `frontend/src/components/Header.tsx`: Factory header, live simulation clock, status badge, scenario presets, and reset trigger.
- `frontend/src/components/KPICardGrid.tsx`: Production telemetry cards (Makespan, On-time Rate, Total Tardiness, Machine Utilisation, Job Queue status) with delta indicators.
- `frontend/src/components/GanttChart.tsx`: High-precision interactive SVG/CSS Gantt timeline displaying machine tracks, job allocations, breakdown intervals, and current time cursor.
- `frontend/src/components/MachineGrid.tsx`: Status and health telemetry cards for all 5 shop-floor machines.
- `frontend/src/components/DisruptionPanel.tsx`: Interactive control panel to configure and trigger machine breakdowns and material delivery delays.
- `frontend/src/components/RecoveryPanel.tsx`: Prominent optimization trigger invoking Google OR-Tools CP-SAT, solver runtime metrics, and constraint verification badge.
- `frontend/src/components/ComparisonTable.tsx`: Before-and-After delta comparison table, recovery gain highlights, and job-by-job shift analysis.
- `frontend/src/components/JobListView.tsx`: Detailed manufacturing order queue with customer, priority, machine, due date, and tardiness status.

## C. Navigation Guidance
- All components receive typed props from [frontend/src/types/index.ts](file:///k:/Projects/FlowOpt/frontend/src/types/index.ts).
- For overall layout orchestration, see [frontend/src/App.tsx](file:///k:/Projects/FlowOpt/frontend/src/App.tsx).
- For style tokens and classes, see [frontend/src/index.css](file:///k:/Projects/FlowOpt/frontend/src/index.css).
