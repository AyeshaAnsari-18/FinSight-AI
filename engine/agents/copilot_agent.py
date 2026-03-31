from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from core.llm_setup import get_llm

def run_copilot_rag(role: str, message: str, context: str, history: list) -> str:
    llm = get_llm(temperature=0.7)
    
    system_prompt = f"""You are the FinSight AI Copilot. You are an expert financial, compliance, auditing, and management assistant.
    The current user logged into the platform is a {role}.
    Your responses MUST be tailored specifically to the {role} role. You must maintain Strict Role-Based Access Control (RBAC).
    Do not disclose information, secrets, or perform actions that belong to a different role (e.g., if you are Compliance, do not answer Manager queries). If asked about features outside the {role}'s domain, politely decline stating your security restrictions to prevent prompt injection or hacking.
    
    Here is the live data context fetched from the FinSight-AI PostgreSQL database related to the user's workspace (use this to answer their questions accurately):
    {context}
    
    Respond directly to the user's query in markdown. Be concise but helpful. Ensure a highly professional, confident, and polite tone.
    """
    
    messages = [SystemMessage(content=system_prompt)]
    
    for msg in history:
        if msg.get("role") == "user":
            messages.append(HumanMessage(content=msg.get("content", "")))
        elif msg.get("role") == "assistant":
            messages.append(AIMessage(content=msg.get("content", "")))
            
    messages.append(HumanMessage(content=message))
    
    try:
        response = llm.invoke(messages)
        return response.content
    except Exception as e:
        return f"System AI Error: {str(e)}"
