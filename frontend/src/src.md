# Frontend Source Context (`frontend/src/src.md`)

## A. Directory Purpose
`frontend/src` contains the application source code for the FlowOpt user interface. It is organized into types, API client, presentation components, and global styling tokens.

## B. File Index
- `frontend/src/src.md`: This context documentation file.
- `frontend/src/main.tsx`: React application mounting point.
- `frontend/src/App.tsx`: Top-level application state, polling/refresh logic, and dashboard grid layout.
- `frontend/src/index.css`: Comprehensive industrial dark theme design system (color tokens, glassmorphic cards, telemetry status badges, responsive layout).
- `frontend/src/vite-env.d.ts`: Vite environment type declarations.
- `frontend/src/types/`: TypeScript definitions reflecting backend models. See `frontend/src/types/types.md`.
- `frontend/src/api/`: REST API client communicating with FastAPI. See `frontend/src/api/api.md`.
- `frontend/src/components/`: Modular UI dashboard components. See `frontend/src/components/components.md`.

## C. Navigation Guidance
- To modify UI state management and main orchestration, inspect [App.tsx](file:///k:/Projects/FlowOpt/frontend/src/App.tsx).
- To inspect or refine specific UI widgets (Gantt, KPIs, Machine Telemetry), explore [components/](file:///k:/Projects/FlowOpt/frontend/src/components/components.md).
- To update color schemes or styling variables, check [index.css](file:///k:/Projects/FlowOpt/frontend/src/index.css).
