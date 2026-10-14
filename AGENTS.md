# FlowOpt Operating Instructions & Agent Guidelines

## 1. Operating Principles
- **FlowOpt Root**: The root directory of the repository is `k:\Projects\FlowOpt`. Do not create extraneous wrapper folders.
- **Mandatory Navigation Protocol**: Before examining or altering any source code:
  1. Read `AGENTS.md` (this file).
  2. Read `primary.md` for overall architecture, tech stack, and directory mappings.
  3. Consult the respective `<directory>/<directory>.md` context file before reading or modifying files in that directory.
- **Incremental Context Updates**: Whenever files, directories, interfaces, or architectures change, update the corresponding `<directory>/<directory>.md` file and `primary.md`.
- **Reproducible Determinism**: Factory simulation and scheduling algorithms must be deterministic, seedable, and measurable.
- **No Fabricated Data**: Displayed KPIs, recovery gains, and scheduling shifts must be strictly computed from actual algorithmic schedule allocations (e.g. Google OR-Tools CP-SAT or exact heuristics).

## 2. Directory Context File Convention
Every meaningful folder must contain a markdown file named after the folder:
- Root Navigation: `primary.md`
- Backend: `backend/backend.md`
  - Backend App: `backend/app/app.md`
    - API Routes: `backend/app/api/api.md`
    - Engine & Optimiser: `backend/app/engine/engine.md`
    - Data Models: `backend/app/models/models.md`
  - Backend Tests: `backend/tests/tests.md`
- Frontend: `frontend/frontend.md`
  - Frontend Source: `frontend/src/src.md`
    - Types: `frontend/src/types/types.md`
    - API Client: `frontend/src/api/api.md`
    - UI Components: `frontend/src/components/components.md`

## 3. Technology Stack & Running the Application
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Google OR-Tools (CP-SAT), Pytest, Uvicorn.
  - Startup command: `python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload`
  - Test command: `pytest backend/tests -v`
- **Frontend**: React 18 / Vite / TypeScript / Lucide Icons.
  - Startup command: `npm run dev` (in `frontend/` directory)
