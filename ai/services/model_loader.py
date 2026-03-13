import joblib
import os

# Model files live in the ai/ directory itself (same folder as this services/ package)
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..')  # ai/ root


class ModelRegistry:
    _smoke_model   = None
    _anomaly_model = None
    _scaler        = None
    _tf_available  = False

    @classmethod
    def load_all(cls):
        anomaly_path = os.path.join(MODEL_DIR, 'ecochain_anomaly_model.pkl')
        scaler_path  = os.path.join(MODEL_DIR, 'scaler.pkl')
        smoke_path   = os.path.join(MODEL_DIR, 'smoke_detection_model.h5')

        # ── Load anomaly model + scaler (always available) ──────────────
        if not os.path.exists(anomaly_path):
            raise FileNotFoundError(f"Anomaly model not found: {anomaly_path}")
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler not found: {scaler_path}")

        print("Loading anomaly detection model (IsolationForest)...")
        cls._anomaly_model = joblib.load(anomaly_path)

        print("Loading StandardScaler...")
        cls._scaler = joblib.load(scaler_path)

        # ── Try loading TF smoke model (optional — requires Python <=3.12) ──
        if os.path.exists(smoke_path):
            try:
                import tensorflow as tf   # lazy import
                print("Loading smoke detection model (MobileNetV2)...")
                cls._smoke_model = tf.keras.models.load_model(smoke_path)
                cls._tf_available = True
                print("✅ Smoke model loaded (TensorFlow available).")
            except ImportError:
                print("⚠️  TensorFlow not installed (Python 3.13+ not supported yet).")
                print("    Smoke detection endpoint will return satellite_risk_score=5 (no smoke assumed).")
            except Exception as e:
                print(f"⚠️  Could not load smoke model: {e}")
        else:
            print(f"⚠️  Smoke model not found at {smoke_path}. Smoke detection disabled.")

        print("✅ Core models loaded. Service is ready.")

    @classmethod
    def smoke_model(cls):
        return cls._smoke_model  # may be None — callers must handle this

    @classmethod
    def anomaly_model(cls):
        if cls._anomaly_model is None:
            raise RuntimeError("Anomaly model not loaded. Ensure startup completed.")
        return cls._anomaly_model

    @classmethod
    def scaler(cls):
        if cls._scaler is None:
            raise RuntimeError("Scaler not loaded. Ensure startup completed.")
        return cls._scaler

    @classmethod
    def all_loaded(cls):
        return cls._anomaly_model is not None and cls._scaler is not None

    @classmethod
    def smoke_available(cls):
        return cls._tf_available and cls._smoke_model is not None
