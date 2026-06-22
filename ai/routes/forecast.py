from fastapi import APIRouter, HTTPException
from schemas.forecast_schema import ForecastRequest
from services.forecast_service import generate_forecast

router = APIRouter()


@router.post("/forecast", summary="Generate 6-month emission forecast for an industry company")
async def forecast_emissions(data: ForecastRequest):
    """
    Generate a forward-looking H2 emission forecast for the given company.

    Called by the EcoChain Express backend at GET /api/ai/forecast (industry route).

    Inputs:
      - companyName: company identifier
      - sector: industry sector (steel | cement | power | textile | manufacturing | logistics | agriculture | other)
      - annualBudget: company's annual carbon budget in tCO2e

    Returns:
      - period: forecast window (e.g. "H2 2025")
      - predicted_emissions: tCO2e projected
      - predicted_credits_needed: CCR credits to purchase
      - risk_level: 'Low' | 'Medium' | 'High'
      - confidence: model confidence percentage
      - explanation: human-readable AI recommendation text
    """
    try:
        result = generate_forecast(
            company_name=data.companyName,
            sector=data.sector or "other",
            annual_budget=data.annualBudget or 0,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")
