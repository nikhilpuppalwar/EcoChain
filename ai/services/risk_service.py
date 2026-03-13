from .anomaly_service import run_anomaly_detection

# Industry sector benchmarks: expected tCO2e per unit of production
# Source: GHG Protocol / IPCC sector averages
SECTOR_BENCHMARKS = {
    "steel":        2.0,   # tCO2e per tonne of steel produced
    "cement":       0.9,   # tCO2e per tonne of cement
    "power":        0.82,  # tCO2e per MWh generated
    "textile":      0.3,   # tCO2e per kg of textile
    "manufacturing":1.2,   # tCO2e per tonne manufactured
    "logistics":    0.15,  # tCO2e per tonne-km
    "agriculture":  1.5,   # tCO2e per hectare
    "other":        1.0,   # default benchmark
}


def calculate_benchmark_score(industry_type: str, production: float, actual_emission: float) -> dict:
    """
    Compare actual emission against sector benchmark.
    Returns benchmark_score (5/25/50) and deviation percentage.
    """
    benchmark_ratio = SECTOR_BENCHMARKS.get(industry_type.lower(), SECTOR_BENCHMARKS["other"])
    expected_emission = benchmark_ratio * production

    if expected_emission == 0 or production == 0:
        return {"score": 5, "deviation_pct": 0.0, "expected_emission": 0.0}

    deviation_pct = ((actual_emission - expected_emission) / expected_emission) * 100

    if deviation_pct < 20:
        score = 5
    elif deviation_pct < 50:
        score = 25
    else:
        score = 50

    return {
        "score": score,
        "deviation_pct": round(deviation_pct, 2),
        "expected_emission": round(expected_emission, 2)
    }


def calculate_full_risk(data) -> dict:
    """
    Main risk scoring function combining all 3 model scores.
    
    Formula:
      Final Risk Score = (0.50 × anomaly_score) + (0.30 × satellite_score) + (0.20 × benchmark_score)
    
    Flags:
      GREEN  → Final score < 25
      YELLOW → Final score 25–60
      RED    → Final score > 60
    """
    # 1. Run IsolationForest anomaly detection
    anomaly_result = run_anomaly_detection(data)
    anomaly_score  = anomaly_result["anomaly_score"]  # 0 or 100

    # 2. Satellite/smoke score
    smoke_detected = getattr(data, 'smoke_detected', None)
    if smoke_detected is True:
        satellite_score = 40
    else:
        satellite_score = 5  # no image or no smoke → assume clean

    # 3. Sector benchmark comparison
    benchmark_result = calculate_benchmark_score(
        getattr(data, 'industry_type', 'other'),
        getattr(data, 'production_rate', 0),
        getattr(data, 'emission_level', 0)
    )
    benchmark_score = benchmark_result["score"]

    # 4. Weighted final risk score
    final_score = (0.50 * anomaly_score) + (0.30 * satellite_score) + (0.20 * benchmark_score)

    # 5. Flag
    if final_score < 25:
        flag = "GREEN"
    elif final_score <= 60:
        flag = "YELLOW"
    else:
        flag = "RED"

    # 6. Human-readable explanation for government portal
    explanation_parts = []
    if anomaly_score == 100:
        explanation_parts.append("AI detected abnormal emission patterns (IsolationForest flagged as outlier)")
    if satellite_score == 40:
        explanation_parts.append("Smoke detected in satellite/industrial imagery")
    if benchmark_score >= 25:
        dev = benchmark_result["deviation_pct"]
        ind = getattr(data, 'industry_type', 'industry')
        explanation_parts.append(f"Emissions are {dev}% above sector benchmark for {ind}")
    if not explanation_parts:
        explanation_parts.append("All indicators within normal range")

    return {
        "submission_id":           getattr(data, 'submission_id', None),
        "anomaly_score":           anomaly_score,
        "satellite_score":         satellite_score,
        "benchmark_score":         benchmark_score,
        "final_risk_score":        round(final_score, 2),
        "risk_flag":               flag,
        "is_flagged":              flag in ["RED", "YELLOW"],
        "anomaly_result":          anomaly_result["anomaly_result"],
        "benchmark_deviation_pct": benchmark_result["deviation_pct"],
        "expected_emission":       benchmark_result["expected_emission"],
        "smoke_detected":          smoke_detected,
        "explanation":             ". ".join(explanation_parts)
    }
