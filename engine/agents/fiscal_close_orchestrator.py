from langgraph.graph import StateGraph, END
from langchain_core.output_parsers import JsonOutputParser

from core.llm_setup import get_llm
from core.prompts import get_journal_auditor_prompt, get_task_auditor_prompt, get_cfo_prompt
from schemas.agent_models import FiscalState, FinalReport

# --- NODES ---

def audit_journals_node(state: FiscalState):
    llm = get_llm()
    data = state["raw_data"].get("journals", {})
    
    chain = get_journal_auditor_prompt() | llm | JsonOutputParser()
    try:
        result = chain.invoke({"data": data})
        return {"journal_issues": result.get("issues", [])}
    except Exception as e:
        return {"journal_issues": [f"Failed to audit journals: {str(e)}"]}

def audit_tasks_node(state: FiscalState):
    llm = get_llm()
    data = state["raw_data"].get("tasks", {})
    
    chain = get_task_auditor_prompt() | llm | JsonOutputParser()
    try:
        result = chain.invoke({"data": data})
        return {"task_issues": result.get("issues", [])}
    except Exception as e:
        return {"task_issues": [f"Failed to audit tasks: {str(e)}"]}

def cfo_evaluation_node(state: FiscalState):
    llm = get_llm()
    parser = JsonOutputParser(pydantic_object=FinalReport)
    
    all_issues = state.get("journal_issues", []) + state.get("task_issues", [])
    
    chain = get_cfo_prompt() | llm | parser
    try:
        result = chain.invoke({
            "issues": all_issues if all_issues else "No issues found. Books are clean.",
            "format_instructions": parser.get_format_instructions()
        })
        return {
            "readiness_score": result["readiness_score"],
            "final_narrative": result["final_narrative"]
        }
    except Exception as e:
        return {"readiness_score": 0, "final_narrative": "CRITICAL ERROR: AI CFO failed to generate report."}

# --- GRAPH COMPILATION ---

workflow = StateGraph(FiscalState)

workflow.add_node("audit_journals", audit_journals_node)
workflow.add_node("audit_tasks", audit_tasks_node)
workflow.add_node("cfo_evaluation", cfo_evaluation_node)

workflow.set_entry_point("audit_journals")
workflow.add_edge("audit_journals", "audit_tasks")
workflow.add_edge("audit_tasks", "cfo_evaluation")
workflow.add_edge("cfo_evaluation", END)

fiscal_orchestrator = workflow.compile()

# --- EXECUTION ENDPOINT ---

def run_fiscal_orchestration(raw_data: dict):
    initial_state = {
        "raw_data": raw_data,
        "journal_issues": [],
        "task_issues": [],
        "readiness_score": 0,
        "final_narrative": ""
    }
    result = fiscal_orchestrator.invoke(initial_state)
    return {
        "readiness_score": result["readiness_score"],
        "issues": result["journal_issues"] + result["task_issues"],
        "narrative": result["final_narrative"]
    }