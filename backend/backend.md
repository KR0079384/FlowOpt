# Backend Context (`backend/backend.md`)

## A. Directory Purpose
The `backend` directory houses the Python application for FlowOpt, including data models, the deterministic factory environment, the scheduling and disruption logic, the Google OR-Tools CP-SAT recovery optimiser, REST API routes, and automated unit/integration tests.

## B. File Index
- `backend/backend.md`: This context documentation file.
- `backend/requirements.txt`: Python package requirements (fastapi, uvicorn, pydantic, ortools, pytest).
- `backend/app/`: The FastAPI web server and core scheduling/optimisation modules. See `backend/app/app.md`.
- `backend/tests/`: Pytest suite covering models, scheduling, disruption, OR-Tools optimization, and API endpoints. See `backend/tests/tests.md`.

## C. Navigation Guidance
- To inspect or edit the optimisation algorithm, see [engine.md](file:///k:/Projects/FlowOpt/backend/app/engine/engine.md) and [optimizer.py](file:///k:/Projects/FlowOpt/backend/app/engine/optimizer.py).
- To inspect or edit data models, see [models.md](file:///k:/Projects/FlowOpt/backend/app/models/models.md) and [schemas.py](file:///k:/Projects/FlowOpt/backend/app/models/schemas.py).
- To inspect API endpoints, see [api.md](file:///k:/Projects/FlowOpt/backend/app/api/api.md) and [routes.py](file:///k:/Projects/FlowOpt/backend/app/api/routes.py).
- To run tests:
  ```bash
  pytest backend/tests -v
  ```
- To run the development server:
  ```bash
  python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
