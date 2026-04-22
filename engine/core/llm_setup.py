import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

DEFAULT_GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")


def get_llm(temperature=0, model_name=None):
    # Centralizes the API key and model choice for the entire engine
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is missing from .env file")

    return ChatGroq(
        temperature=temperature, 
        model_name=model_name or DEFAULT_GROQ_MODEL,
        api_key=api_key
    )
