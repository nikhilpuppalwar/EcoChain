from fastapi import APIRouter, HTTPException
from services.risk_service import calculate_full_risk
from schemas.risk_schema import RiskScoringRequest

router = APIRouter()


@router.post("/risk-score", summary="Compute full risk score combining all 3 AI models")
async def compute_risk_score(data: RiskScoringRequest):
    """
    Primary endpoint called by EcoChain backend after every emission submission.
    Combines:
      - IsolationForest anomaly detection (50% weight)
      - Smoke detection satellite score (30% weight)
      - Sector benchmark deviation score (20% weight)
    
    Returns: final_risk_score, risk_flag (GREEN/YELLOW/RED), is_flagged (bool),
             and detailed explanation for the government portal G3 screen.
    """
    try:
        result = calculate_full_risk(data)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk scoring failed: {str(e)}")
