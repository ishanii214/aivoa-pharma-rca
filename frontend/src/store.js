import { configureStore } from "@reduxjs/toolkit";
import rcaReducer from "./slices/rcaSlice";

export const store = configureStore({
  reducer: {
    rca: rcaReducer,
  },
});

export default store;