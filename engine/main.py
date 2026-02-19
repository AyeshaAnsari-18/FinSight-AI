from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File

# Import AI Agents
from agents.ocr_agent import run_ocr_extraction
from agents.fiscal_agent import run_real_fiscal_analysis
from agents.reconcile_agent import run_reconciliation_analysis
from agents.fiscal_close_orchestrator import run_fiscal_orchestration
from agents.forecasting_agent import run_forecast_prediction, run_what_if_analysis

# Import Pydantic Schemas (Best Practice)
from schemas.api_models import ForecastInput
from schemas.api_models import JournalInput, ReconcileInput, FiscalCloseInput

app = FastAPI(title="FinSight AI Orchestrator")

# Allow NestJS to hit this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-journal")
async def analyze_journal(data: JournalInput):
    result = run_real_fiscal_analysis(data.dict())
    return result

@app.post("/analyze-reconciliation")
async def analyze_reconciliation(data: ReconcileInput):
    result = run_reconciliation_analysis(data.bank_balance, data.ledger_balance, data.notes)
    return result


@app.post("/orchestrate-fiscal-close")
async def orchestrate_fiscal_close(data: FiscalCloseInput):
    # Triggers the multi-node LangGraph
    result = run_fiscal_orchestration(data.dict())
    return result 

@app.post("/predict-forecast")
async def predict_forecast(data: ForecastInput):
    return run_forecast_prediction(data.historical_data)

@app.post("/predict-what-if")
async def predict_what_if(data: ForecastInput):
    return run_what_if_analysis(data.historical_data)

@app.post("/extract-document")
async def extract_document(file: UploadFile = File(...)):
    file_bytes = await file.read()
    result = run_ocr_extraction(file_bytes, file.filename)
    return result