from pydantic import BaseModel
from typing import List

class JournalInput(BaseModel):
    description: str
    debit: float
    credit: float
    reference: str

class ReconcileInput(BaseModel):
    bank_balance: float
    ledger_balance: float
    notes: str

# 🚀 THE FIX: Prisma sends arrays (lists), not dictionaries.
class FiscalCloseInput(BaseModel):
    journals: list 
    tasks: list

class ForecastInput(BaseModel):
    historical_data: list # List of dicts: {month: "YYYY-MM", revenue: float, expenses: float}