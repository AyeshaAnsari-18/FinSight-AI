import json
from typing import Dict, Any
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

# Initialize Groq LLM
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.3,
    response_format={"type": "json_object"}
)

def run_fiscal_agent(fiscal_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process fiscal data with LangChain LLM and return a structured JSON dict.
    """

    prompt = f"""
You are an accounting assistant. Process the following fiscal data (monthly) and return ONLY a JSON object with this exact structure:

{{
  "total_income": number,
  "total_expense": number,
  "profit_loss": number,
  "kpis": {{
    "avg_monthly_income": number,
    "avg_monthly_expense": number,
    "highest_income_month": string,
    "highest_expense_month": string
  }},
  "summary": "text"
}}

DATA:
{json.dumps(fiscal_json, indent=2)}
"""

    try:
        result = llm.invoke(prompt)
        content = result.content.strip()

        # Extract JSON
        start = content.find("{")
        end = content.rfind("}")
        if start == -1 or end == -1:
            raise ValueError("Model output did not contain a JSON object")

        json_text = content[start:end+1]
        fiscal_summary = json.loads(json_text)

        # normalization
        def to_number(v):
            try:
                return float(v)
            except:
                return v

        fm = fiscal_summary
        fm["total_income"] = to_number(fm.get("total_income", 0))
        fm["total_expense"] = to_number(fm.get("total_expense", 0))
        fm["profit_loss"] = to_number(fm.get("profit_loss", 0))

        k = fm.get("kpis", {})
        k["avg_monthly_income"] = to_number(k.get("avg_monthly_income", 0))
        k["avg_monthly_expense"] = to_number(k.get("avg_monthly_expense", 0))
        fm["kpis"] = k

        return fm

    except Exception as e:
        raise RuntimeError(f"Fiscal agent failed: {str(e)}")
