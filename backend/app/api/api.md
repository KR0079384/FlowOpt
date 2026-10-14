# API Routes Context (`backend/app/api/api.md`)

## A. Directory Purpose
`backend/app/api` houses the REST API endpoints and router definitions for FlowOpt. It mediates communication between the frontend client and the underlying scheduling and optimization engine.

## B. File Index
- `backend/app/api/api.md`: This context documentation file.
- `backend/app/api/routes.py`: FastAPI route handlers for state retrieval, disruption injection, recovery optimization, scenario presets, and simulation reset.

## C. Navigation Guidance
- To inspect or add endpoints, edit [routes.py](file:///k:/Projects/FlowOpt/backend/app/api/routes.py).
- For request/response schemas, refer to [backend/app/models/schemas.py](file:///k:/Projects/FlowOpt/backend/app/models/schemas.py).
- For engine integration, refer to [backend/app/engine/engine.md](file:///k:/Projects/FlowOpt/backend/app/engine/engine.md).
