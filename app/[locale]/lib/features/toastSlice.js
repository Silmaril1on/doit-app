import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isVisible: false,
  msg: "",
  type: "error",
  // For type="basic" confirmation toasts — arbitrary serializable payload.
  confirmData: null,
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    setToast: (state, action) => {
      const {
        msg,
        type,
        confirmData = null,
      } = typeof action.payload === "string"
        ? { msg: action.payload, type: "error" }
        : action.payload;

      const normalizedType = type === "succes" ? "success" : type;

      state.msg = msg || "";
      state.type = normalizedType || "error";
      state.isVisible = Boolean(msg);
      state.confirmData = confirmData;
    },
    clearToast: (state) => {
      state.isVisible = false;
      state.msg = "";
      state.type = "error";
      state.confirmData = null;
    },
  },
});

export const { setToast, clearToast } = toastSlice.actions;
export const selectToast = (state) => state.toast;

export default toastSlice.reducer;
