from pydantic import BaseModel, Field
from typing import Optional


class ForecastRequest(BaseModel):
    companyName: str
    sector: Optional[str] = "other"
    annualBudget: Optional[float] = Field(default=10000.0, ge=0)


class ForecastResponse(BaseModel):
    period: str
    predicted_emissions: float
    predicted_credits_needed: float
    risk_level: str   # 'Low' | 'Medium' | 'High'
    confidence: float  # percentage 0-100
    explanation: str
