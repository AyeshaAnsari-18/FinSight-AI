# FinSight AI - Agent Engine 🤖

The engine handles core AI interactions, Retrieval-Augmented-Generation (RAG), and advanced generative NLP mapping using **FastAPI** and **LangChain**. Built on top of **Groq Llama-3.1-8b**, delivering blazing fast intelligent responses strictly restricted to each user's authenticated role structure.

## Setup & Running
1. Recommended: create an isolated Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # MacOS:
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create `.env` containing your Groq API string:
   ```env
   GROQ_API_KEY="..."
   ```

4. Run the API Engine:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

The engine naturally listens on `http://localhost:8000`. The NestJS backend acts as a proxy, verifying and appending Role-Based rules behind the scenes before hitting this engine's `/copilot/rag` endpoints.
