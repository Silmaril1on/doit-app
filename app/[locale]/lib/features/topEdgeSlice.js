import { createSlice } from "@reduxjs/toolkit";

const topEdgeSlice = createSlice({
  name: "topEdge",
  initialState: { collapsed: true },
  reducers: {
    setTopEdgeCollapsed(state, action) {
      state.collapsed = action.payload;
    },
  },
});

export const { setTopEdgeCollapsed } = topEdgeSlice.actions;
export const selectTopEdgeCollapsed = (state) => state.topEdge.collapsed;

export default topEdgeSlice.reducer;
