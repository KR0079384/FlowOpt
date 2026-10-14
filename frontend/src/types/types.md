# Frontend Types Context (`frontend/src/types/types.md`)

## A. Directory Purpose
`frontend/src/types` defines all TypeScript interfaces and types representing the factory simulation state, equipment telemetry, production jobs, schedules, disruptions, and mathematical comparisons.

## B. File Index
- `frontend/src/types/types.md`: This context documentation file.
- `frontend/src/types/index.ts`: TypeScript interfaces mirroring backend Pydantic models.

## C. Navigation Guidance
- When updating schema models in `backend/app/models/schemas.py`, make corresponding updates to [index.ts](file:///k:/Projects/FlowOpt/frontend/src/types/index.ts) to maintain strict client-server type parity.
