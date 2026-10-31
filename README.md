# AI-Powered Pharmaceutical RCA & CAPA Platform

An end-to-end Root Cause Analysis (RCA) and Corrective and Preventive Action (CAPA) management system tailored for active pharmaceutical ingredient (API) manufacturing compliance.

## Tech Stack
- **Frontend:** React, Redux Toolkit, Tailwind CSS
- **Backend:** FastAPI, Pydantic, SQLAlchemy ORM
- **AI / Orchestration:** LangGraph (StateGraph pipeline: Extraction -> 5-Whys & 6M Fishbone -> Gap & CAPA Generation)
- **Database:** SQLite / MySQL

## Key Features
- **Unstructured Extraction:** Ingests raw deviation narratives and extracts batch metadata.
- **Agentic Causality Engine:** Chains 5-Whys and 6M Ishikawa dimensions with automated fallback mechanisms.
- **Human-in-the-Loop Validation:** Complete editable form state ensuring QA compliance before submission.
- **Audit-Ready Reporting:** Tailored print stylesheets for single-click GxP PDF export.

## Setup Instructions

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows)
4. `pip install -r requirements.txt`
5. `uvicorn main:app --reload --port 8000`

### Frontend
1. `cd frontend`
2. `npm install` (or `pnpm install`)
3. `npm run dev`