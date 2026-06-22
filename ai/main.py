from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from services.model_loader import ModelRegistry
from routes import smoke, anomaly, risk, forecast

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load all models at startup
    ModelRegistry.load_all()
    yield

app = FastAPI(
    title="EcoChain AI Service",
    version="1.0.0",
    description="AI service for emission anomaly detection, smoke detection, and risk scoring",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(smoke.router,    prefix="/ai", tags=["Smoke Detection"])
app.include_router(anomaly.router,  prefix="/ai", tags=["Anomaly Detection"])
app.include_router(risk.router,     prefix="/ai", tags=["Risk Scoring"])
app.include_router(forecast.router, prefix="",    tags=["Emission Forecast"])

@app.get("/ai/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "models_loaded": ModelRegistry.all_loaded(),
        "service": "EcoChain AI"
    }

@app.get("/", tags=["Health"])
def root():
    return {"message": "EcoChain AI Service is running. Use /ai/health to check status."}
