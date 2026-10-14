"""
FlowOpt Application Entry Point.
Configures FastAPI, CORS middleware, API routers, and health check.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes import router

app = FastAPI(
    title="FlowOpt — Intelligent Production Recovery Simulator API",
    description="Deterministic industrial factory simulator and Google OR-Tools CP-SAT production recovery engine.",
    version="1.0.0",
)

# Enable CORS for local development and frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "system": "FlowOpt Intelligent Production Recovery Simulator",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": {
            "state": "/api/factory/state",
            "reset": "/api/simulation/reset",
            "disrupt": "/api/simulation/disrupt",
            "recover": "/api/simulation/recover",
            "scenarios": "/api/simulation/scenarios",
            "docs": "/docs"
        }
    }
