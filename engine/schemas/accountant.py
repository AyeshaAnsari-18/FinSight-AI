from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class VendorRecordDTO(BaseModel):
    id: str
    vendor: str
    date: date
    status: str = Field(..., description="Completed, In Progress, Variance Detected, Pending Review")
    variance: float
    notes: Optional[str] = None

class AlertDTO(BaseModel):
    id: str
    message: str
    severity: str = Field(..., description="high, medium, low")
    timestamp: date

class ReportDTO(BaseModel):
    id: str
    name: str
    month: str
    revenue: float
    expenses: float
    status: str