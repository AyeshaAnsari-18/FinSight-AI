from langchain_core.output_parsers import JsonOutputParser
from core.llm_setup import get_llm
from core.prompts import get_forecast_prompt, get_what_if_prompt
from schemas.agent_models import ForecastReport, WhatIfReport

def run_forecast_prediction(historical_data: list):
    llm = get_llm(temperature=0.2) # Low temp for math/financial accuracy
    parser = JsonOutputParser(pydantic_object=ForecastReport)
    chain = get_forecast_prompt() | llm | parser
    
    try:
        return chain.invoke({
            "data": historical_data,
            "format_instructions": parser.get_format_instructions()
        })
    except Exception as e:
        return {"error": str(e)}

def run_what_if_analysis(historical_data: list):
    llm = get_llm(temperature=0.4) # Slightly higher temp for strategic creative scenarios
    parser = JsonOutputParser(pydantic_object=WhatIfReport)
    chain = get_what_if_prompt() | llm | parser
    
    try:
        return chain.invoke({
            "data": historical_data,
            "format_instructions": parser.get_format_instructions()
        })
    except Exception as e:
        return {"error": str(e)}