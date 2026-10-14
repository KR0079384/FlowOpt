# Application Package Context (`backend/app/app.md`)

## A. Directory Purpose
`backend/app` is the core Python application package for FlowOpt. It coordinates the FastAPI web application, mounts route handlers, configures Cross-Origin Resource Sharing (CORS), and provides submodules for data modeling, simulation logic, and API exposure.

## B. File Index
- `backend/app/app.md`: This context documentation file.
- `backend/app/main.py`: FastAPI application entry point, CORS middleware, startup events, and root health check endpoint.
- `backend/app/models/`: Pydantic data schemas representing factory entities, disruptions, schedules, and KPIs. See `backend/app/models/models.md`.
- `backend/app/engine/`: Core simulation, baseline scheduler, disruption injector, Google OR-Tools CP-SAT optimiser, and KPI calculators. See `backend/app/engine/engine.md`.
- `backend/app/api/`: REST API routing and HTTP request controllers. See `backend/app/api/api.md`.

## C. Navigation Guidance
- To inspect application bootstrap and route registration, check [main.py](file:///k:/Projects/FlowOpt/backend/app/main.py).
- For data schemas, navigate into [models/](file:///k:/Projects/FlowOpt/backend/app/models/models.md).
- For mathematical scheduling and optimization logic, navigate into [engine/](file:///k:/Projects/FlowOpt/backend/app/engine/engine.md).
- For REST endpoints, navigate into [api/](file:///k:/Projects/FlowOpt/backend/app/api/api.md).
