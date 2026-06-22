from pydantic import BaseModel, Field
from typing import Optional


class AnomalyDetectionRequest(BaseModel):
    submission_id: str = Field(..., description="MongoDB submission ID for logging")
    industry_id:   str = Field(..., description="MongoDB industry ID")
    industry_type: str = Field(..., description="steel | cement | power | textile | other")

    # The 5 features the IsolationForest was trained on
    production_rate:              float = Field(..., ge=0, description="Production output this period")
    emission_level:               float = Field(..., ge=0, description="Total CO2e emissions (tCO2e)")
    fuel_consumption:             float = Field(..., ge=0, description="Total fuel consumed (litres or kg)")
    electricity_usage:            float = Field(..., ge=0, description="Electricity consumed (kWh)")
    emission_to_production_ratio: float = Field(..., ge=0, description="Computed: emission_level / production_rate")


class AnomalyDetectionResponse(BaseModel):
    submission_id:         str
    anomaly_result:        str    # 'NORMAL' | 'ANOMALY'
    raw_prediction:        int    # 1 (normal) or -1 (anomaly)
    anomaly_score:         float  # 0 or 100, used in risk calculation
    risk_flag:             str    # 'GREEN' | 'RED' preliminary flag
    feature_values_scaled: list   # the 5 scaled values actually passed to model
