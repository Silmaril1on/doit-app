import { createSlice } from "@reduxjs/toolkit";

const configSlice = createSlice({
  name: "config",
  initialState: { colorValue: "teal" },
  reducers: {
    setColorValue(state, action) {
      state.colorValue = action.payload;
    },
    clearColorValue(state) {
      state.colorValue = "teal";
    },
  },
});

export const { setColorValue, clearColorValue } = configSlice.actions;
export const selectColorValue = (state) => state.config?.colorValue ?? "teal";
export default configSlice.reducer;
