import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const extractInvestigation = createAsyncThunk(
  "rca/extractInvestigation",
  async ({ rawText, file }, { rejectWithValue }) => {
    const formData = new FormData();
    if (rawText) formData.append("raw_text", rawText);
    if (file) formData.append("file", file);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(
          errorData.detail || `Extract failed: ${response.status}`
        );
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "Extract request failed");
    }
  }
);

export const analyzeInvestigation = createAsyncThunk(
  "rca/analyzeInvestigation",
  async ({ rawText, file }, { rejectWithValue }) => {
    const formData = new FormData();
    if (rawText) formData.append("raw_text", rawText);
    if (file) formData.append("file", file);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(
          errorData.detail || `Analyze failed: ${response.status}`
        );
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "Analyze request failed");
    }
  }
);

export const fetchInvestigations = createAsyncThunk(
  "rca/fetchInvestigations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/investigations/", {
        method: "GET",
      });
      if (!response.ok) {
        return rejectWithValue(`Fetch failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "Fetch investigations failed");
    }
  }
);

const initialState = {
  batchId: "",
  productName: "",
  deviationDescription: "",
  investigationApproach: "",
  rcaFindings: null,
  missingEvidence: "",
  capaRecommendations: null,
  status: "open",
  loading: false,
  error: null,
  extraction: null,
  analysis: null,
  investigations: [],
};

const rcaSlice = createSlice({
  name: "rca",
  initialState,
  reducers: {
    setFormField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    clearForm: (state) => {
      state.batchId = "";
      state.productName = "";
      state.deviationDescription = "";
      state.investigationApproach = "";
      state.status = "open";
    },
    setAnalysisResults: (state, action) => {
      state.rcaFindings = action.payload.rcaFindings;
      state.missingEvidence = action.payload.missingEvidence;
      state.capaRecommendations = action.payload.capaRecommendations;
      state.status = action.payload.status || state.status;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(extractInvestigation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(extractInvestigation.fulfilled, (state, action) => {
        state.loading = false;
        state.extraction = action.payload;
        state.batchId = action.payload.batch_id || "";
        state.productName = action.payload.product_name || "";
        state.deviationDescription = action.payload.deviation_description || "";
      })
      .addCase(extractInvestigation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Extraction failed";
      })
      .addCase(analyzeInvestigation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeInvestigation.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
        state.batchId = action.payload.batch_id || state.batchId;
        state.productName = action.payload.product_name || state.productName;
        state.deviationDescription = action.payload.deviation_description || state.deviationDescription;
        state.investigationApproach = action.payload.investigation_approach || "5-Whys and Fishbone Analysis";
        
        state.rcaFindings = action.payload.root_cause_findings || action.payload.five_whys;
        state.missingEvidence = action.payload.missing_evidence || "";
        state.capaRecommendations = action.payload.capa_actions || action.payload.capa_recommendations;
        state.status = action.payload.status || "in_review";
      })
      .addCase(analyzeInvestigation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Analysis failed";
      })
      .addCase(fetchInvestigations.fulfilled, (state, action) => {
        state.investigations = action.payload;
      })
      .addCase(fetchInvestigations.rejected, (state, action) => {
        state.error = action.payload || "Failed to load investigations";
      });
  },
});

export const { setFormField, clearForm, setAnalysisResults, clearError } = rcaSlice.actions;
export default rcaSlice.reducer;