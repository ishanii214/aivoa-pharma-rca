from typing import Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


# --- Database & Base Investigation Schemas ---

class InvestigationBase(BaseModel):
    batch_id: str
    product_name: str
    deviation_description: str
    investigation_approach: str
    rca_findings: Optional[Any] = None
    missing_evidence: Optional[str] = None
    capa_recommendations: Optional[Any] = None
    status: Optional[str] = "open"


class InvestigationCreate(InvestigationBase):
    pass


class InvestigationUpdate(BaseModel):
    batch_id: Optional[str] = None
    product_name: Optional[str] = None
    deviation_description: Optional[str] = None
    investigation_approach: Optional[str] = None
    rca_findings: Optional[Any] = None
    missing_evidence: Optional[str] = None
    capa_recommendations: Optional[Any] = None
    status: Optional[str] = None


class InvestigationResponse(InvestigationBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- LangGraph Workflow & AI Structured Schemas ---

class FiveWhysSchema(BaseModel, extra="allow"):
    why_1: Optional[str] = Field(default="", description="First why / initial cause")
    why_2: Optional[str] = Field(default="", description="Second why")
    why_3: Optional[str] = Field(default="", description="Third why")
    why_4: Optional[str] = Field(default="", description="Fourth why")
    why_5: Optional[str] = Field(default="", description="Fifth why / Root cause")


class FishboneSchema(BaseModel, extra="allow"):
    man: Optional[str] = Field(default="", description="Factor related to personnel/man")
    machine: Optional[str] = Field(default="", description="Factor related to equipment/machine")
    method: Optional[str] = Field(default="", description="Factor related to process/method")
    material: Optional[str] = Field(default="", description="Factor related to raw materials")
    measurement: Optional[str] = Field(default="", description="Factor related to measurement/testing")
    environment: Optional[str] = Field(default="", description="Factor related to environment")


class CAPAItemSchema(BaseModel, extra="allow"):
    action_description: str = Field(description="Description of the corrective/preventive action")
    owner: Optional[str] = Field(default="QA Department", description="Responsible owner")
    due_date: Optional[str] = Field(default="30 Days", description="Timeline or target date")


class ExtractionRequest(BaseModel):
    raw_text: str


class ExtractionResponse(BaseModel):
    batch_id: str
    product_name: str
    deviation_description: str
    extraction_complete: bool


class AnalyzeRequest(BaseModel):
    raw_text: str


class AnalyzeResponse(BaseModel):
    batch_id: Optional[str] = ""
    product_name: Optional[str] = ""
    deviation_description: Optional[str] = ""
    investigation_approach: Optional[str] = "5-Whys and Fishbone Analysis"
    root_cause_findings: Optional[str] = ""
    five_whys: Optional[FiveWhysSchema] = Field(default_factory=FiveWhysSchema)
    fishbone: Optional[FishboneSchema] = Field(default_factory=FishboneSchema)
    missing_evidence: Optional[str] = ""
    capa_actions: Optional[List[CAPAItemSchema]] = Field(default_factory=list)
    capa_recommendations: Optional[Any] = None
    status: Optional[str] = "completed"