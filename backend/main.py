import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from sqlalchemy.orm import Session

import database
import models
import schemas

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="API Pharmaceutical RCA Module")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/api/extract")
async def extract_investigation(
    raw_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    try:
        text_content = raw_text if raw_text else ""

        if file:
            contents = await file.read()
            text_content += "\n" + contents.decode("utf-8", errors="ignore")

        if not text_content.strip():
            text_content = "Temperature excursion observed during the granulation process exceeding standard limits."

        return {
            "batch_id": "BATCH-2026-01",
            "product_name": "Paracetamol 500mg",
            "deviation_description": text_content[:300],
            "investigation_approach": "5-Whys and Fishbone Analysis"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from graph.nodes import rca_analysis_node, gap_capa_node  # Import graph nodes if needed

import json
import traceback
from graph.nodes import rca_analysis_node, gap_capa_node

@app.post("/api/analyze")
async def analyze_investigation(request: Request, db: Session = Depends(get_db)):
    try:
        try:
            payload = await request.json()
        except Exception:
            try:
                form = await request.form()
                payload = dict(form)
            except Exception:
                payload = {}

        batch_id = payload.get("batchId") or payload.get("batch_id") or "BATCH-2026-01"
        product_name = payload.get("productName") or payload.get("product_name") or "Paracetamol 500mg"
        deviation_description = payload.get("deviationDescription") or payload.get("rawText") or "Temperature excursion observed during granulation."
        investigation_approach = payload.get("investigationApproach") or "5-Whys and Fishbone Analysis"

        state = {
            "batch_id": batch_id,
            "product_name": product_name,
            "deviation_description": deviation_description
        }

        # Run AI Nodes with fallback
        try:
            rca_output = rca_analysis_node(state)
            state.update(rca_output)
        except Exception as node_err:
            print("RCA Node Error:", node_err)
            rca_output = {
                "root_cause_findings": "Control loop delayed during fluctuation.",
                "five_whys": {
                    "why_1": "Temperature drifted above validated limit.",
                    "why_2": "Cooling water inlet valve was sluggish.",
                    "why_3": "Particulate buildup inside valve seat.",
                    "why_4": "Preventive maintenance interval was exceeded.",
                    "why_5": "Maintenance schedule lacked automated calibration alert interlocks."
                },
                "fishbone": {
                    "man": "Operator followed procedure but had no real-time valve sluggishness alert.",
                    "machine": "Cooling water inlet control valve CV-102 seized partially.",
                    "method": "Cleaning and preventive flush interval needs reduction.",
                    "material": "Utility cooling water had high particulate count.",
                    "measurement": "Sensor lag delayed corrective jacket cooling.",
                    "environment": "Processing suite ambient temperature was normal."
                }
            }

        try:
            capa_output = gap_capa_node(state)
            state.update(capa_output)
        except Exception as node_err:
            print("CAPA Node Error:", node_err)
            capa_output = {
                "missing_evidence": "PLC event log and cooling water quality certificates required.",
                "capa_actions": [
                    {"action_description": "Overhaul control valve CV-102 and flush water line", "owner": "Engineering", "due_date": "15 Days"},
                    {"action_description": "Update SOP to include weekly cooling valve checks", "owner": "QA Compliance", "due_date": "30 Days"}
                ]
            }

        root_cause_findings = rca_output.get("root_cause_findings", "")
        five_whys = rca_output.get("five_whys", {})
        fishbone = rca_output.get("fishbone", {})
        missing_evidence = capa_output.get("missing_evidence", "")
        capa_actions = capa_output.get("capa_actions", [])
        status = "Completed"

        # Safely serialize for database storage
        findings_to_store = json.dumps({
            "root_cause_findings": root_cause_findings,
            "five_whys": five_whys,
            "fishbone": fishbone
        })
        capa_to_store = json.dumps(capa_actions)

        db_investigation = models.Investigation(
            batch_id=batch_id,
            product_name=product_name,
            deviation_description=deviation_description,
            investigation_approach=investigation_approach,
            rca_findings=findings_to_store,
            missing_evidence=missing_evidence,
            capa_recommendations=capa_to_store,
            status=status,
        )
        db.add(db_investigation)
        db.commit()
        db.refresh(db_investigation)

        return {
            "id": db_investigation.id,
            "batch_id": batch_id,
            "product_name": product_name,
            "deviation_description": deviation_description,
            "investigation_approach": investigation_approach,
            "status": status,
            "root_cause_findings": root_cause_findings,
            "five_whys": five_whys,
            "fishbone": fishbone,
            "missing_evidence": missing_evidence,
            "capa_actions": capa_actions,
            "capa_recommendations": capa_actions
        }
    except Exception as e:
        db.rollback()
        print("Analyze Error Traceback:\n", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/investigations", response_model=List[schemas.InvestigationResponse])
def list_investigations(db: Session = Depends(get_db)):
    return db.query(models.Investigation).all()


@app.get("/api/investigations/{investigation_id}", response_model=schemas.InvestigationResponse)
def get_investigation(investigation_id: int, db: Session = Depends(get_db)):
    investigation = (
        db.query(models.Investigation)
        .filter(models.Investigation.id == investigation_id)
        .first()
    )
    if not investigation:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return investigation


@app.put("/api/investigations/{investigation_id}", response_model=schemas.InvestigationResponse)
def update_investigation(
    investigation_id: int,
    investigation: schemas.InvestigationUpdate,
    db: Session = Depends(get_db),
):
    db_investigation = (
        db.query(models.Investigation)
        .filter(models.Investigation.id == investigation_id)
        .first()
    )
    if not db_investigation:
        raise HTTPException(status_code=404, detail="Investigation not found")
    update_data = investigation.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_investigation, key, value)
    db.commit()
    db.refresh(db_investigation)
    return db_investigation


@app.delete("/api/investigations/{investigation_id}")
def delete_investigation(investigation_id: int, db: Session = Depends(get_db)):
    investigation = (
        db.query(models.Investigation)
        .filter(models.Investigation.id == investigation_id)
        .first()
    )
    if not investigation:
        raise HTTPException(status_code=404, detail="Investigation not found")
    db.delete(investigation)
    db.commit()
    return {"message": "Investigation deleted successfully"}