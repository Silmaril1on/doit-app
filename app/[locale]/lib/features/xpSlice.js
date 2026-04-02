import { createSlice } from "@reduxjs/toolkit";
import { XP_PER_LEVEL } from "../services/xp/xpConfig";

const initialState = {
  totalXp: 0,
  level: 1,
  currentXp: 0, // XP within the current level (0 – XP_PER_LEVEL-1)
};

const xpSlice = createSlice({
  name: "xp",
  initialState,
  reducers: {
    // Full replace — used on hydration and after server confirms the new value.
    setXp(state, action) {
      const { total_xp, current_level } = action.payload ?? {};
      state.totalXp = total_xp ?? 0;
      state.level = current_level ?? 1;
      state.currentXp = state.totalXp % XP_PER_LEVEL;
    },
  },
});

export const { setXp } = xpSlice.actions;
export const selectXp = (state) => state.xp;
export default xpSlice.reducer;
