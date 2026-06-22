@echo off
echo Starting EcoChain Report Generator (Python FastAPI)...
cd /d "%~dp0"

:: Install dependencies if needed
pip install -r ../requirements.txt --quiet

:: Start the server on port 8001
uvicorn api:app --host 0.0.0.0 --port 8001 --reload
