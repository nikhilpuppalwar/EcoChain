import os
import sys
import uuid
import threading

# Ensure the backend directory is in the Python path for sibling imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from report_generator import generate_report, REPORTS_DIR


app = FastAPI(title="EcoChain Report Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "EcoChain Report Generator API is running."}


class ReportData(BaseModel):
    company: str
    industry: str
    revenue: float

    diesel: float
    petrol: float
    coal: float

    electricity: float

    transport_distance: float
    cargo_weight: float

    waste_generated: float
    waste_recycled: float

    employees: int
    female_employees: int

    board_members: int
    female_directors: int


JOBS = {}  # In-memory dictionary: job_id -> dict(status, report, error)

def run_job(job_id: str, data_dict: dict):
    try:
        file_path = generate_report(data_dict)
        JOBS[job_id]["status"] = "completed"
        JOBS[job_id]["report"] = os.path.basename(file_path)
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)

@app.post("/generate-report-async")
def create_report_async(data: ReportData):
    job_id = str(uuid.uuid4())
    JOBS[job_id] = {"status": "processing"}
    threading.Thread(target=run_job, args=(job_id, data.model_dump())).start()
    return {"job_id": job_id}

@app.get("/report-status/{job_id}")
def get_report_status(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    return JOBS[job_id]

# Keep synchronous block around for backwards compat 
@app.post("/generate-report")
def create_report(data: ReportData):
    file_path = generate_report(data.model_dump())
    return {"report": file_path}


@app.get("/download/{filename}")
def download_report(filename: str):
    # Security: only allow .docx files from the reports directory
    if not filename.endswith(".docx") or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = os.path.join(REPORTS_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(
        path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=filename,
    )