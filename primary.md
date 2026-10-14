# FlowOpt — Root Navigation & Architecture Index (`primary.md`)

## 1. Project Purpose & Architecture Overview
**FlowOpt** is a software-only industrial production scheduling and recovery simulator. It models a high-precision manufacturing plant where production jobs (with compatibility constraints, processing times, priorities, and due dates) are scheduled across machines.

When factory disruptions happen (such as machine breakdowns or material shipment delays), FlowOpt detects schedule conflicts, preserves already completed operations, and activates a genuine mathematical optimisation engine (Google OR-Tools CP-SAT) to generate an optimal or near-optimal recovery schedule. It directly benchmarks before-and-after operational KPIs (makespan, total weighted tardiness, on-time delivery rate, machine utilisation).

```
FlowOpt Root (k:\Projects\FlowOpt)
 ├── AGENTS.md                          # Mandatory operating instructions
 ├── primary.md                         # Root navigation map (this file)
 ├── README.md                          # Project documentation and demo guide
 ├── backend/                           # Python FastAPI & Optimisation Backend
 │   ├── backend.md                     # Backend root context
 │   ├── requirements.txt               # Backend dependencies
 │   ├── app/                           # Core application package
 │   │   ├── app.md                     # Application package context
 │   │   ├── main.py                    # FastAPI entry point & CORS configuration
 │   │   ├── models/                    # Pydantic schemas
 │   │   │   ├── models.md              # Models directory context
 │   │   │   └── schemas.py             # Machine, Job, Schedule, Disruption, KPI models
 │   │   ├── engine/                    # Scheduling, Disruption & OR-Tools recovery engine
 │   │   │   ├── engine.md              # Engine directory context
 │   │   │   ├── factory_data.py        # Deterministic seed data & factory configuration
 │   │   │   ├── scheduler.py           # Baseline forward scheduler & constraint validator
 │   │   │   ├── disruption.py          # Breakdown & material delay simulator
 │   │   │   ├── optimizer.py           # Google OR-Tools CP-SAT recovery optimiser
 │   │   │   └── kpi.py                 # Mathematical KPI calculators & schedule diff engine
 │   │   └── api/                       # REST API route handlers
 │   │       ├── api.md                 # API directory context
 │   │       └── routes.py              # Endpoints: state, disrupt, recover, scenarios, reset
 │   └── tests/                         # Pytest test suite
 │       ├── tests.md                   # Tests directory context
 │       ├── test_models.py             # Schema validation tests
 │       ├── test_scheduler.py          # Baseline scheduling tests
 │       ├── test_disruption.py         # Breakdown & delay conflict tests
 │       ├── test_optimizer.py          # OR-Tools constraint satisfaction tests
 │       ├── test_kpi.py                # Metric & KPI comparison calculation tests
 │       └── test_api.py                # End-to-end API route tests
 └── frontend/                          # React + TypeScript + Vite Dashboard
     ├── frontend.md                    # Frontend directory context
     ├── package.json                   # Frontend dependencies & scripts
     ├── tsconfig.json                  # TypeScript configuration
     ├── vite.config.ts                 # Vite bundler configuration
     ├── index.html                     # Single-page HTML entry
     └── src/                           # Frontend source code
         ├── src.md                     # Source root context
         ├── main.tsx                   # React DOM root entry
         ├── App.tsx                    # Top-level state & layout orchestration
         ├── index.css                  # Industrial design system tokens & styles
         ├── vite-env.d.ts              # Vite environment type declarations
         ├── types/                     # TypeScript definitions
         │   ├── types.md               # Types context
         │   └── index.ts               # Shared domain interfaces
         ├── api/                       # Backend client
         │   ├── api.md                 # API client context
         │   └── client.ts              # Fetch wrappers for FlowOpt backend
         └── components/                # UI Presentation & Control Components
             ├── components.md          # Components directory context
             ├── Header.tsx             # Navbar with factory telemetry & presets
             ├── KPICardGrid.tsx        # High-impact metric cards with delta badges
             ├── GanttChart.tsx         # Interactive machine timeline & disruption zones
             ├── MachineGrid.tsx        # Machine status, telemetry, and health
             ├── DisruptionPanel.tsx    # Breakdown & material delay configuration
             ├── RecoveryPanel.tsx      # Recovery action & mathematical solver status
             ├── ComparisonTable.tsx    # Before/Disrupted/Recovered KPI & job diffs
             └── JobListView.tsx        # Production job order queue & tardiness
```

## 2. Technology Stack
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn, Google OR-Tools (CP-SAT Solver), Pytest.
- **Frontend**: React 18, Vite, TypeScript, Lucide React (Icons), Vanilla CSS (Custom Industrial Dark Theme design tokens).
- **Protocol**: Typed REST JSON.

## 3. Directory Context File System
Every meaningful directory has a dedicated markdown context file:
- `backend/backend.md`: Backend overview, virtualenv/packages, and execution instructions.
- `backend/app/app.md`: App-level routing and lifecycle overview.
- `backend/app/models/models.md`: Pydantic data structures, validations, and domain types.
- `backend/app/engine/engine.md`: Factory seed generation, baseline scheduling, disruption simulator, OR-Tools CP-SAT formulation, and KPI engine.
- `backend/app/api/api.md`: HTTP endpoints, request/response models, and error handling.
- `backend/tests/tests.md`: Test plan, test cases, and pytest commands.
- `frontend/frontend.md`: Vite setup, packages, and build scripts.
- `frontend/src/src.md`: Application entry, state management, and styling approach.
- `frontend/src/types/types.md`: TypeScript interfaces matching backend models.
- `frontend/src/api/api.md`: API client functions and mock fallbacks if needed.
- `frontend/src/components/components.md`: Component responsibilities and UI design system.

## 4. Entry Points
- **Backend API**: `backend.app.main:app` (via `python -m uvicorn backend.app.main:app --port 8000 --reload`)
- **Backend Tests**: `pytest backend/tests -v`
- **Frontend Web**: `frontend/` (via `npm run dev`)

## 5. Mandatory Navigation Protocol
1. Start at `AGENTS.md` and `primary.md`.
2. Navigate into the relevant directory context file (e.g. `backend/app/engine/engine.md`).
3. Inspect and edit specific files noted in the context file.
4. Keep the context file updated with any added files, modified interfaces, or changed constraints.
5. Validate via automated test suite.
