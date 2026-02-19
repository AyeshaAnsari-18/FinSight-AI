from langchain_core.prompts import ChatPromptTemplate

def get_reconcile_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", """You are an expert AI forensic accountant. 
        1. Compare the bank and ledger balances and confirm the exact variance.
        2. Analyze the context notes deeply. 
        3. Write a detailed, professional explanation of WHY this variance occurred based on the notes.
        4. Provide actionable next steps for the accountant to resolve this discrepancy.
        Output strictly in JSON.\n{format_instructions}"""),
        ("human", "Bank Balance: {bank}\nLedger Balance: {ledger}\nContext/Notes: {notes}")
    ])

def get_journal_auditor_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", """You are an AI Auditor. Review these journal stats. 
        If there are any FLAGGED or DRAFT journals, output them as specific issues. 
        If none, output an empty list. 
        CRITICAL: Output strictly JSON with an 'issues' array. The array MUST contain ONLY plain text strings, NOT objects."""),
        ("human", "Journal Data: {data}")
    ])

def get_task_auditor_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", """You are an AI Compliance Officer. Review these task stats. 
        If there are pending HIGH or URGENT tasks, flag them. 
        CRITICAL: Output strictly JSON with an 'issues' array. The array MUST contain ONLY plain text strings, NOT objects."""),
        ("human", "Task Data: {data}")
    ])

def get_cfo_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", """You are the AI CFO. Review the issues found by your auditors. 
        Generate a readiness score and a professional executive summary for the human Manager. 
        Output strictly JSON.\n{format_instructions}"""),
        ("human", "Issues Found:\n{issues}")
    ])

def get_forecast_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", """You are an AI Chief Financial Officer. Analyze the provided historical revenue and expense data. 
        Calculate the average growth or burn rate. 
        Generate realistic 'Best Case', 'Worst Case', and 'Most Likely' financial projections for the upcoming quarter. 
        Output strictly in JSON.\n{format_instructions}"""),
        ("human", "Historical Data: {data}")
    ])

def get_what_if_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", """You are an AI Financial Strategist. Analyze the historical data. 
        Generate 3 highly plausible 'What-If' scenarios (e.g., 'Revenue drops by 10% due to market conditions', 'Operating expenses increase by 15%'). 
        Calculate the projected outcome and provide a brief strategic insight for the human Manager. 
        Output strictly in JSON.\n{format_instructions}"""),
        ("human", "Historical Data: {data}")
    ])

def get_ocr_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", """You are an expert financial data extraction AI.
        Extract the exact financial details from the provided text.
        If a value is missing, infer it if obvious, otherwise use 0 for numbers or 'UNKNOWN' for strings.
        
        Output strictly in JSON.
        {format_instructions}"""),
        ("human", "RAW DOCUMENT TEXT:\n{text}")
    ])