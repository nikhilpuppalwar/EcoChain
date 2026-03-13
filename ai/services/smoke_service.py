import numpy as np
from PIL import Image
import io
from .model_loader import ModelRegistry

IMG_SIZE = (224, 224)  # MobileNetV2 required input size
CLASSES  = ["NO_SMOKE", "SMOKE_DETECTED"]


def preprocess_image(image_bytes: bytes):
    """Convert raw image bytes to MobileNetV2-ready numpy array."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.size[0] < 32 or img.size[1] < 32:
            return None, "Image too small (minimum 32x32)"
        img = img.convert("RGB")
        img = img.resize(IMG_SIZE, Image.LANCZOS)
        arr = np.array(img, dtype=np.float32) / 255.0
        return np.expand_dims(arr, axis=0), None  # shape: (1, 224, 224, 3)
    except Exception as e:
        return None, f"Invalid image file: {str(e)}"


def predict_smoke(image_bytes: bytes) -> dict:
    # Graceful fallback when TF/smoke model unavailable (Python 3.13+)
    if not ModelRegistry.smoke_available():
        return {
            "result": "UNAVAILABLE",
            "smoke_probability": 0.0,
            "no_smoke_probability": 1.0,
            "satellite_risk_score": 5,   # conservative: assume no smoke
            "confidence": 0.0,
            "smoke_detected": None,
            "warning": "Smoke detection unavailable — TensorFlow requires Python ≤ 3.12. Using default satellite_risk_score=5."
        }

    processed, error = preprocess_image(image_bytes)
    if error:
        return {"error": error}

    model = ModelRegistry.smoke_model()
    predictions = model.predict(processed, verbose=0)  # shape: (1, 2)

    no_smoke_prob = float(predictions[0][0])
    smoke_prob    = float(predictions[0][1])

    label = CLASSES[int(smoke_prob > no_smoke_prob)]
    satellite_risk_score = 40 if label == "SMOKE_DETECTED" else 5

    return {
        "result": label,
        "smoke_probability": round(smoke_prob, 4),
        "no_smoke_probability": round(no_smoke_prob, 4),
        "satellite_risk_score": satellite_risk_score,
        "confidence": round(max(smoke_prob, no_smoke_prob) * 100, 2),
        "smoke_detected": label == "SMOKE_DETECTED"
    }
