from pydantic import BaseModel, Field
from typing import Optional


class RiskScoringRequest(BaseModel):
    submission_id: str
    industry_id:   str
    industry_type: str   # 'steel' | 'cement' | 'power' | 'textile' | 'other'

    # Emission data (for anomaly model + benchmark)
    production_rate:              float = Field(..., ge=0)
    emission_level:               float = Field(..., ge=0)
    fuel_consumption:             float = Field(..., ge=0)
    electricity_usage:            float = Field(..., ge=0)
    emission_to_production_ratio: float = Field(..., ge=0)

    # Smoke detection result (optional — may not always have satellite image)
    smoke_detected: Optional[bool] = None  # True if image was uploaded and smoke found


class RiskScoringResponse(BaseModel):
    submission_id:      str

    # Component scores
    anomaly_score:      float   # 0 or 100 (from IsolationForest)
    satellite_score:    float   # 40 or 5 (from smoke detection)
    benchmark_score:    float   # 5, 25, or 50 (from sector comparison)

    # Final
    final_risk_score:   float   # weighted combination
    risk_flag:          str     # 'GREEN' | 'YELLOW' | 'RED'
    is_flagged:         bool    # True if RED or YELLOW above threshold

    # Detail for government portal display
    anomaly_result:          str    # 'NORMAL' | 'ANOMALY'
    benchmark_deviation_pct: float  # how far from sector benchmark
    explanation:             str    # human-readable summary
