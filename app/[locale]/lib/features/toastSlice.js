import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isVisible: false,
  msg: "",
  type: "error",
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    setToast: (state, action) => {
      const { msg, type } =
        typeof action.payload === "string"
          ? { msg: action.payload, type: "error" }
          : action.payload;

      const normalizedType = type === "succes" ? "success" : type;

      state.msg = msg || "";
      state.type = normalizedType || "error";
      state.isVisible = Boolean(msg);
    },
    clearToast: (state) => {
      state.isVisible = false;
      state.msg = "";
      state.type = "error";
    },
  },
});

export const { setToast, clearToast } = toastSlice.actions;
export const selectToast = (state) => state.toast;

export default toastSlice.reducer;
