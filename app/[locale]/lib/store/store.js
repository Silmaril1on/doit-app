import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import modalReducer from "../features/modalSlice";
import toastReducer from "../features/toastSlice";
import xpReducer from "../features/xpSlice";
import topEdgeReducer from "../features/topEdgeSlice";
import configReducer from "../features/configSlice";

export const makeStore = (preloadedState) =>
  configureStore({
    reducer: {
      user: userReducer,
      modal: modalReducer,
      toast: toastReducer,
      xp: xpReducer,
      topEdge: topEdgeReducer,
      config: configReducer,
    },
    preloadedState,
  });

export const store = makeStore();
