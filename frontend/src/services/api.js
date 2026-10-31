import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Extract batch ID, product name, and deviation details from text or PDF.
 * Accepts either raw_text (string) or file (File), or both.
 */
export const extractInvestigationApi = async (rawText, file) => {
  const formData = new FormData();
  if (rawText) formData.append("raw_text", rawText);
  if (file) formData.append("file", file);
  const response = await api.post("/api/extract", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Run the full LangGraph RCA workflow: extraction -> 5-Whys -> CAPA.
 */
export const analyzeInvestigationApi = async (rawText, file) => {
  const formData = new FormData();
  if (rawText) formData.append("raw_text", rawText);
  if (file) formData.append("file", file);
  const response = await api.post("/api/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Fetch all investigations (CRUD list endpoint).
 */
export const fetchInvestigationsApi = async () => {
  const response = await api.get("/api/investigations/");
  return response.data;
};

/**
 * Create a new investigation.
 */
export const createInvestigationApi = async (investigation) => {
  const response = await api.post("/api/investigations/", investigation);
  return response.data;
};

/**
 * Get a single investigation by ID.
 */
export const getInvestigationApi = async (id) => {
  const response = await api.get(`/api/investigations/${id}`);
  return response.data;
};

/**
 * Update an investigation by ID.
 */
export const updateInvestigationApi = async (id, updates) => {
  const response = await api.put(`/api/investigations/${id}`, updates);
  return response.data;
};

/**
 * Delete an investigation by ID.
 */
export const deleteInvestigationApi = async (id) => {
  const response = await api.delete(`/api/investigations/${id}`);
  return response.data;
};

export default api;