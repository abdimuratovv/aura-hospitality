from fastapi import FastAPI

from app.jobs.fraud_scan import run as run_fraud_scan

app = FastAPI(title="AURA AI Service")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/jobs/fraud-scan")
def trigger_fraud_scan():
    return run_fraud_scan()
