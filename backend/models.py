from sqlalchemy import Column, Integer, String, Text, JSON
from database import Base


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(100), index=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    deviation_description = Column(Text, nullable=False)
    investigation_approach = Column(Text, nullable=False)
    rca_findings = Column(JSON, nullable=True)
    missing_evidence = Column(Text, nullable=True)
    capa_recommendations = Column(JSON, nullable=True)
    status = Column(String(50), default="open", nullable=False)