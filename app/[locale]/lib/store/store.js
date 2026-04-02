import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import modalReducer from "../features/modalSlice";
import toastReducer from "../features/toastSlice";
import xpReducer from "../features/xpSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    modal: modalReducer,
    toast: toastReducer,
    xp: xpReducer,
  },
});
