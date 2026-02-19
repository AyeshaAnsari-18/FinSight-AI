from pydantic import BaseModel, Field
from typing import List
from langchain_core.output_parsers import JsonOutputParser

# Import from our core modules!
from core.llm_setup import get_llm
from core.prompts import get_reconcile_prompt

class ReconciliationResult(BaseModel):
    matched: bool = Field(description="True if bank and ledger balances match perfectly")
    variance: float = Field(description="The numerical difference between bank and ledger")
    discrepancies: List[str] = Field(description="A detailed, professional explanation of the variance and actionable next steps.")

def run_reconciliation_analysis(bank_balance: float, ledger_balance: float, context_notes: str):
    # 1. Initialize modular components
    llm = get_llm()
    prompt = get_reconcile_prompt()
    parser = JsonOutputParser(pydantic_object=ReconciliationResult)
    
    # 2. Build the chain
    chain = prompt | llm | parser
    
    # 3. Execute
    try:
        result = chain.invoke({
            "bank": bank_balance,
            "ledger": ledger_balance,
            "notes": context_notes,
            "format_instructions": parser.get_format_instructions()
        })
        return result
    except Exception as e:
        variance = abs(bank_balance - ledger_balance)
        return {
            "matched": variance == 0,
            "variance": variance,
            "discrepancies": [f"AI Processing Error: {str(e)}. Please check API limits or input format."]
        }