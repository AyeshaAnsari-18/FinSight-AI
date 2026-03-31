# FinSight AI 🚀

FinSight AI is a next-generation Enterprise Risk & Compliance platform designed for mid-to-large financial teams. It unifies accounting pipelines, automated internal auditing, compliance policy matching, and strict Role-Based Access Controls under a single intelligent system powered by an embedded AI Copilot via LangChain and Llama3.

## Features
- **Strict Role-Based Experiences**: Isolated environments for `ACCOUNTANT`, `AUDITOR`, `COMPLIANCE`, and `MANAGER` roles. Each role sees customized dashboards, global searches, and tailored navigation.
- **Continuous Audit Engine**: Automated detection of duplicate payments, anomalous journal entries, and unauthorized ledger modifications.
- **RAG-Powered AI Copilot**: A secure role-aware chat interface built with FastAPI, LangChain, and Groq's Llama-3.1-8b that helps users understand policy and investigate risks based *only* on what their role allows. It integrates context across policies, journals, text, and tasks.
- **Unified Global Search**: Robust cross-domain search querying Tasks, Journals, Documents, and Policies natively with ID mapping and intelligent redirection across the entire platform.
- **Database Architecture**: Powered by Supabase (PostgreSQL) and Prisma ORM for maximum scalability, data persistence, and type-safety.

## Architecture & Project Structure
The repository is split into three core microservices:

1. `/backend` - The primary transactional **NestJS** REST API, Auth service, and Supabase/Prisma engine.
2. `/client` - The frontend **React/Vite/Tailwind** SPA with Redux Toolkit for complex state management caching.
3. `/engine` - The **FastAPI** Python microservice executing the LangChain AI agent workflows utilizing Groq LLaMA models.

Check the `README.md` in each respective directory for local development setup instructions!
