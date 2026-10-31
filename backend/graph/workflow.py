"""
LangGraph workflow wiring the three RCA investigation nodes:

extraction -> rca_analysis -> gap_capa
"""

from typing import Any, Dict

from langgraph.graph import END, StateGraph

from .nodes import extraction_node, rca_analysis_node, gap_capa_node


class InvestigationState(Dict[str, Any]):
    """Typed state carried through the LangGraph workflow."""

    pass


def build_graph():
    """Build and compile the LangGraph StateGraph."""
    workflow = StateGraph(InvestigationState)

    workflow.add_node("extraction", extraction_node)
    workflow.add_node("rca_analysis", rca_analysis_node)
    workflow.add_node("gap_capa", gap_capa_node)

    workflow.set_entry_point("extraction")
    workflow.add_edge("extraction", "rca_analysis")
    workflow.add_edge("rca_analysis", "gap_capa")
    workflow.add_edge("gap_capa", END)

    return workflow.compile()


# Compiled graph application, importable by FastAPI routes.
app = build_graph()


def run_investigation(raw_text: str) -> Dict[str, Any]:
    """Convenience helper to run the full graph end-to-end."""
    initial_state: InvestigationState = {
        "raw_text": raw_text,
        "batch_id": "",
        "product_name": "",
        "deviation_description": "",
        "five_whys": [],
        "missing_evidence": "",
        "capa_recommendations": [],
        "status": "open",
    }
    return app.invoke(initial_state)