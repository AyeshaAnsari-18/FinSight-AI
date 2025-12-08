# backend/main.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict
from fiscal.FiscalCloseAgent import run_fiscal_agent
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Fiscal Agent API")

# allow local dev origins (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FiscalRequest(BaseModel):
    data: Dict[str, Any]

@app.post("/run-fiscal-agent")
async def run_agent(payload: FiscalRequest):
    try:
        result = run_fiscal_agent(payload.data)
        return {"success": True, "result": result}
    except Exception as e:
        # return error details for debugging (change in prod)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}


"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agent import generate_report

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # your react domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/generate-report")
async def report_endpoint(request: dict):
    result = await generate_report(request)
    return result
"""