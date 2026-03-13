from fastapi import APIRouter, HTTPException
from services.anomaly_service import run_anomaly_detection
from schemas.anomaly_schema import AnomalyDetectionRequest

router = APIRouter()


@router.post("/anomaly-detect", summary="Detect anomalous emission patterns using IsolationForest")
async def detect_anomaly(data: AnomalyDetectionRequest):
    """
    Run IsolationForest on the 5 emission features to detect anomalous submissions.
    Called internally by the Express.js backend after an emission is submitted.
    Returns: anomaly_result (NORMAL|ANOMALY), anomaly_score (0|100), risk_flag (GREEN|RED).
    """
    try:
        result = run_anomaly_detection(data)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")
