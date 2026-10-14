# Frontend Context (`frontend/frontend.md`)

## A. Directory Purpose
`frontend` contains the client-side user interface for FlowOpt, implemented as a modern React 18 single-page application built with Vite and TypeScript. It displays factory telemetry, KPI trend cards, an interactive machine Gantt timeline, disruption injection controls, an OR-Tools recovery trigger, and side-by-side scenario comparisons.

## B. File Index
- `frontend/frontend.md`: This context documentation file.
- `frontend/package.json`: NPM package metadata, dependencies (React, Lucide Icons), and scripts.
- `frontend/vite.config.ts`: Vite build configuration and local dev proxy.
- `frontend/tsconfig.json`: TypeScript compiler options and JSX configuration.
- `frontend/index.html`: Web application HTML shell and title.
- `frontend/src/`: Application source code, design system, API client, and UI components. See `frontend/src/src.md`.

## C. Navigation Guidance
- To inspect or edit visual design and styling, check [index.css](file:///k:/Projects/FlowOpt/frontend/src/index.css).
- For UI components (Gantt, KPIs, Disruptions, Recovery), see [components/](file:///k:/Projects/FlowOpt/frontend/src/components/components.md).
- For API communication with the FastAPI backend, see [api/](file:///k:/Projects/FlowOpt/frontend/src/api/api.md).
- For TypeScript domain definitions, see [types/](file:///k:/Projects/FlowOpt/frontend/src/types/types.md).
- To start the frontend dev server:
  ```bash
  npm run dev
  ```
