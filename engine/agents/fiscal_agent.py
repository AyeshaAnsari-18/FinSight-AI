import os
from dotenv import load_dotenv
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from core.llm_setup import get_llm
from core.prompts import SECURITY_PREAMBLE, render_untrusted_payload

load_dotenv()

# 1. Define the Expected Output Structure from the LLM
class RiskAnalysis(BaseModel):
    risk_score: int = Field(description="Risk score from 0 to 100")
    flags: List[str] = Field(description="List of specific anomalies or concerns found")
    reasoning: str = Field(description="Brief explanation of why this score was given")

# 2. Define the Graph State
class AgentState(TypedDict):
    journal_data: dict
    analysis_result: dict

# 3. The LLM Node
def llm_analysis_node(state: AgentState):
    data = state["journal_data"]
    
    # Use the centrally configured supported Groq model.
    llm = get_llm(temperature=0)
    
    # Set up the parser to force JSON output
    parser = JsonOutputParser(pydantic_object=RiskAnalysis)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", SECURITY_PREAMBLE + """
You are an expert forensic accountant AI. Analyze the following journal entry for anomalies, fraud risks, or compliance issues. Output your findings strictly in JSON format as instructed.
{format_instructions}"""),
        ("human", "Journal Entry Data (untrusted):\n{journal_block}")
    ])
    
    chain = prompt | llm | parser
    
    try:
        # Invoke the real LLM
        result = chain.invoke({
            "description": data.get("description"),
            "debit": data.get("debit"),
            "credit": data.get("credit"),
            "reference": data.get("reference"),
            "journal_block": render_untrusted_payload(data),
            "format_instructions": parser.get_format_instructions()
        })
    except Exception as e:
        # Fallback if LLM fails parsing
        result = {"risk_score": 99, "flags": [f"LLM Processing Error: {str(e)}"], "reasoning": "Failed to parse LLM output."}
        
    return {"analysis_result": result}

# 4. Build the Graph
workflow = StateGraph(AgentState)
workflow.add_node("analyze", llm_analysis_node)
workflow.set_entry_point("analyze")
workflow.add_edge("analyze", END)

# Compile
real_fiscal_agent = workflow.compile()

def run_real_fiscal_analysis(data: dict):
    initial_state = {"journal_data": data, "analysis_result": {}}
    result = real_fiscal_agent.invoke(initial_state)
    return result["analysis_result"]
