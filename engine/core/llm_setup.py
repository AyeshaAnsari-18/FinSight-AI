import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

def get_llm(temperature=0, model_name="llama-3.1-8b-instant"):
    # Centralizes the API key and model choice for the entire engine
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is missing from .env file")
        
    return ChatGroq(
        temperature=temperature, 
        model_name=model_name,
        api_key=api_key
    )