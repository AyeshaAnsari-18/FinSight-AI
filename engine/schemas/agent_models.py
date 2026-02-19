from typing import TypedDict, List, Dict, Any
from pydantic import BaseModel, Field

class FiscalState(TypedDict):
    raw_data: Dict[str, Any]      
    journal_issues: List[str]     
    task_issues: List[str]        
    readiness_score: int          
    final_narrative: str          

class FinalReport(BaseModel):
    readiness_score: int = Field(description="Score from 0-100 on how ready the books are to close.")
    final_narrative: str = Field(description="A professional executive summary for the Manager explaining the current state of the fiscal close.")

class ScenarioOutput(BaseModel):
    scenario: str = Field(description="Name of scenario (e.g., Best Case, Worst Case, Most Likely)")
    revenue: float = Field(description="Projected revenue as a number")
    expenses: float = Field(description="Projected expenses as a number")
    reasoning: str = Field(description="Brief explanation of the projection based on historical trends")

class ForecastReport(BaseModel):
    forecasts: List[ScenarioOutput]

class WhatIfScenario(BaseModel):
    scenario: str = Field(description="The condition applied (e.g., Revenue +10%, Expenses -5%)")
    outcome: str = Field(description="The financial outcome (e.g., Profit margin increases to 15%)")
    insight: str = Field(description="Strategic advice based on this outcome")

class WhatIfReport(BaseModel):
    analyses: List[WhatIfScenario]

class LineItem(BaseModel):
    description: str = Field(description="Item description")
    quantity: float = Field(description="Quantity purchased")
    unit_price: float = Field(description="Price per unit")
    total: float = Field(description="Total for this line item")

class ExtractedDocumentDTO(BaseModel):
    vendor_name: str = Field(description="Name of the vendor or merchant")
    invoice_number: str = Field(description="Invoice or receipt number")
    date: str = Field(description="Date of the transaction (YYYY-MM-DD)")
    subtotal: float
    tax_amount: float
    total_amount: float
    line_items: List[LineItem] = Field(description="List of items purchased")