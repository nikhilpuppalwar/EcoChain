from fastapi import APIRouter, UploadFile, File, HTTPException
from services.smoke_service import predict_smoke

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_SIZE_MB   = 10


@router.post("/detect-smoke", summary="Detect smoke in industrial site images")
async def detect_smoke(image: UploadFile = File(...)):
    """
    Upload an industrial site image to check for smoke/emissions using MobileNetV2.
    Returns: result (NO_SMOKE | SMOKE_DETECTED), probabilities, and satellite_risk_score.
    """
    # Validate file type
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed: {image.content_type}. Use JPEG, PNG, or WebP."
        )

    # Read and validate size
    image_bytes = await image.read()
    if len(image_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Max size: {MAX_SIZE_MB}MB"
        )

    result = predict_smoke(image_bytes)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {"success": True, "data": result}
