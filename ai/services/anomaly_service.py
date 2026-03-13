import numpy as np
from .model_loader import ModelRegistry


def run_anomaly_detection(data) -> dict:
    """
    Run IsolationForest anomaly detection on 5 emission features.
    
    Expected data fields:
        production_rate, emission_level, fuel_consumption,
        electricity_usage, emission_to_production_ratio
    
    Returns dict with anomaly_result ('NORMAL'|'ANOMALY'), anomaly_score (0 or 100),
    raw_prediction (1 or -1), and scaled feature values.
    """
    model  = ModelRegistry.anomaly_model()
    scaler = ModelRegistry.scaler()

    # Safe ratio calculation (avoid division by zero)
    production = getattr(data, 'production_rate', 0)
    emission   = getattr(data, 'emission_level', 0)

    if production <= 0:
        ratio = 0.0
        print(f"WARNING: production_rate is {production}, setting emission_to_production_ratio = 0")
    else:
        ratio = emission / production

    # Build the 5-feature array in correct order
    raw_features = np.array([[
        production,
        emission,
        getattr(data, 'fuel_consumption', 0),
        getattr(data, 'electricity_usage', 0),
        ratio
    ]], dtype=np.float64)  # shape: (1, 5)

    # Scale to match trained StandardScaler
    scaled_features = scaler.transform(raw_features)  # shape: (1, 5)

    # IsolationForest: 1 = inlier (NORMAL), -1 = outlier (ANOMALY)
    prediction   = model.predict(scaled_features)[0]
    anomaly_score = 100 if prediction == -1 else 0

    return {
        "submission_id":          getattr(data, 'submission_id', None),
        "anomaly_result":         "ANOMALY" if prediction == -1 else "NORMAL",
        "raw_prediction":         int(prediction),
        "anomaly_score":          anomaly_score,
        "risk_flag":              "RED" if prediction == -1 else "GREEN",
        "feature_values_scaled":  scaled_features[0].tolist(),
        "production_rate_used":   float(production),
        "ratio_used":             float(ratio)
    }
