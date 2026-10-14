# Simulation Engine Context (`backend/app/engine/engine.md`)

## A. Directory Purpose
`backend/app/engine` contains the core algorithmic intelligence and mathematical scheduling modules for FlowOpt:
1. Factory deterministic seed data generation.
2. Baseline forward-scheduling and constraint validation.
3. Disruption injection (machine failures and material supply delays).
4. Recovery optimization using Google OR-Tools CP-SAT solver (with heuristic fallback).
5. KPI computation, metric tracking, and before/after schedule diff comparison.

## B. File Index
- `backend/app/engine/engine.md`: This context documentation file.
- `backend/app/engine/factory_data.py`: Provides 5 realistic machines and 15 precision manufacturing jobs with precedence constraints and alternative routing compatibilities.
- `backend/app/engine/scheduler.py`: Calculates the initial baseline schedule, verifies non-overlap constraints, enforces job dependencies, and checks machine compatibility.
- `backend/app/engine/disruption.py`: Applies machine breakdowns and material delivery delays to the factory state, calculating interrupted jobs and naive cascading delays.
- `backend/app/engine/optimizer.py`: Google OR-Tools CP-SAT recovery optimiser. Respects completed work, avoids the breakdown window, enforces precedence and compatibility, and minimizes weighted tardiness + makespan.
- `backend/app/engine/kpi.py`: Calculates makespan, total tardiness, weighted tardiness, on-time delivery percentage, machine utilization, and builds delta comparisons.

## C. Navigation Guidance
- For optimization formulation details, see [optimizer.py](file:///k:/Projects/FlowOpt/backend/app/engine/optimizer.py).
- For disruption simulation mechanics, see [disruption.py](file:///k:/Projects/FlowOpt/backend/app/engine/disruption.py).
- For KPI calculation formulas, see [kpi.py](file:///k:/Projects/FlowOpt/backend/app/engine/kpi.py).
- For sample machine and job seeds, see [factory_data.py](file:///k:/Projects/FlowOpt/backend/app/engine/factory_data.py).
