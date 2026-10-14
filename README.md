# FlowOpt — Intelligent Production Recovery Simulator

**FlowOpt** is an industrial manufacturing scheduling and disruption recovery simulator. It simulates a precision machine shop with 5 high-precision machine tools and 15 customer production jobs. When unexpected disruptions occur (such as CNC spindle breakdowns or raw material delivery delays), FlowOpt formulates the factory state into a Constraint Programming problem and solves it using **Google OR-Tools CP-SAT** to generate a physically valid, optimal recovery schedule.

---

## Key Features

1. **Deterministic Simulated Factory**
   - 5 industrial assets: CNC Mills (M1, M5), Lathe & Turning Center (M2), Laser Profiler (M3), Precision Welder (M4).
   - 15 realistic production jobs with processing times, due dates, customer priority tiers (P1 to P4), and job dependencies.
   - Clean, reproducible baseline schedule with 100% On-Time Delivery.

2. **Interactive Disruption Simulation**
   - **Machine Breakdown**: Inject spindle failures or mechanical downtime on any machine for configurable durations.
   - **Material Delay**: Simulate supply-chain shocks pushing raw material readiness and downstream jobs.
   - **Curated 1-Click Presets**: Quick demonstration scenarios (e.g., *M1 Spindle Failure*, *Inconel Material Delay*, *Compound Disruption*).

3. **Autonomous Production Recovery (Google OR-Tools CP-SAT)**
   - Formulates the recovery schedule as an Integer Programming / Constraint Satisfaction problem.
   - **Freezes Completed Operations**: Work finished prior to the disruption clock time remains immutable.
   - **Respects Equipment Downtime**: Enforces zero job overlap on broken machines during the repair window.
   - **Precedence & Routing Flexibility**: Evaluates alternative compatible machines (e.g., rerouting urgent milling jobs from M1 to M5 beta mill).
   - **Objective Function**: Minimizes weighted tardiness + makespan + excessive reassignment instability.
   - **Fallback**: Includes a priority-aware heuristic fail-safe.

4. **Telemetry Dashboard & Gantt Chart**
   - Real-time KPI cards: Makespan, On-Time Delivery SLA %, Total Tardiness, Shop Utilisation, and Order Queue.
   - High-precision interactive Gantt chart with downtime hatching overlays and live simulation clock cursor.
   - Machine health telemetry cards.
   - Comprehensive Before-and-After KPI Comparison Matrix and Job-by-Job Shift Table.

---

## Quickstart & Running Locally

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Start the Backend API (FastAPI)
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start backend server (port 8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Start the Frontend Dashboard (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: [http://localhost:5173/](http://localhost:5173/)

---

## Running Automated Tests
```bash
# Run full pytest test suite (17 automated tests)
pytest backend/tests -v
```

Tests cover:
- Pydantic domain models and validation rules.
- Baseline schedule generation and physical non-overlap constraint verification.
- Precedence constraint and dependency preservation.
- Disruption cascading impact calculations.
- Google OR-Tools CP-SAT recovery optimizer validity and tardiness reduction.
- End-to-end FastAPI endpoint integration via TestClient.

---

## Demonstration Walkthrough

1. **Inspect Baseline State**:
   - Open `http://localhost:5173/`.
   - Observe the 5 machines and 15 scheduled jobs on the Gantt chart.
   - Notice that baseline On-Time Delivery is **100.0%** and Total Tardiness is **0.0 hrs**.

2. **Inject a Disruption**:
   - In the header, select **"CNC Mill M1 Spindle Failure"** from the *Quick Scenarios...* dropdown (or configure a custom breakdown in the sidebar).
   - The status changes to **DISRUPTION DETECTED**.
   - Machine M1 displays a red hatched downtime window between Hour 8.0 and 16.0.
   - Tardiness rises (e.g., +2.5 hrs late) and On-Time Delivery drops.
   - The Before-and-After Comparison Table appears showing the cascading delay impact.

3. **Run Autonomous Recovery**:
   - Click the prominent **"Optimise Recovery Schedule"** button.
   - Google OR-Tools CP-SAT solves the recovery model in <200ms.
   - The status updates to **SCHEDULE RECOVERED (OR-TOOLS)**.
   - Eligible operations are rerouted (e.g. from broken M1 to compatible M5).
   - Total Tardiness drops back to **0.0 hrs** (2.5 hours saved!).
   - On-Time Delivery SLA is restored to **100.0%**.
   - View the detailed Job Rerouting adjustments table showing exact before/after completion times and machine shifts.

---

## System Limitations & Assumptions
- Deterministic simulation: Clock progresses in discrete simulation hours.
- Discrete time scale: Scheduling uses 0.01-hour resolution (100 ticks per hour) for integer constraint programming.
- Setup times: Machine changeover setup times are assumed to be included within the nominal job processing durations.
