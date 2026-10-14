# Backend Tests Context (`backend/tests/tests.md`)

## A. Directory Purpose
`backend/tests` contains comprehensive automated test suites using `pytest`. It verifies data model integrity, baseline schedule correctness, physical constraint validation, disruption cascading effects, Google OR-Tools CP-SAT recovery optimization, KPI calculations, and REST API routes.

## B. File Index
- `backend/tests/tests.md`: This context documentation file.
- `backend/tests/test_models.py`: Validates Pydantic schemas, enums, and default value assignments.
- `backend/tests/test_scheduler.py`: Tests baseline schedule generation and constraint verification (no machine overlap, valid precedence, machine compatibility).
- `backend/tests/test_disruption.py`: Tests machine breakdowns, material delays, and detection of interrupted jobs.
- `backend/tests/test_optimizer.py`: Tests Google OR-Tools CP-SAT recovery optimization, ensuring preserved completed jobs, non-overlap during breakdowns, and verifiable tardiness reduction.
- `backend/tests/test_kpi.py`: Tests mathematical calculations of makespan, total tardiness, weighted tardiness, utilization, and before/after comparisons.
- `backend/tests/test_api.py`: End-to-end integration tests for all REST endpoints using FastAPI TestClient.

## C. Navigation Guidance
- To run the full test suite:
  ```bash
  pytest backend/tests -v
  ```
- To run specific test files:
  ```bash
  pytest backend/tests/test_optimizer.py -v
  ```
- All test scenarios use deterministic seed data from `backend.app.engine.factory_data`.
