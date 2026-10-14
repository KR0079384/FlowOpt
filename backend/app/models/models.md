# Data Models Context (`backend/app/models/models.md`)

## A. Directory Purpose
`backend/app/models` defines all core domain entities, data validation contracts, request payloads, and response structures for the FlowOpt simulation platform using Pydantic v2.

## B. File Index
- `backend/app/models/models.md`: This context documentation file.
- `backend/app/models/schemas.py`: Pydantic models for Machines, Production Jobs, Schedule Assignments, Disruptions, KPI Metrics, Before/After Comparisons, and Factory State.

## C. Navigation Guidance
- To add or modify machine or job properties, update [schemas.py](file:///k:/Projects/FlowOpt/backend/app/models/schemas.py).
- To inspect how frontend types mirror these models, refer to [frontend/src/types/index.ts](file:///k:/Projects/FlowOpt/frontend/src/types/index.ts).
- All timestamps and durations are represented in deterministic simulation hours (e.g. 8.5 = 8 hours and 30 minutes).
