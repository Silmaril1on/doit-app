import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  modalType: null,
  modalProps: {},
  pendingLevelUp: null, // { prevLevel, newLevel } — queued while completeTask is open
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal(state, action) {
      state.modalType = action.payload.modalType;
      state.modalProps = action.payload.modalProps ?? {};
    },
    closeModal(state) {
      state.modalType = null;
      state.modalProps = {};
    },
    setPendingLevelUp(state, action) {
      state.pendingLevelUp = action.payload; // { prevLevel, newLevel }
    },
    clearPendingLevelUp(state) {
      state.pendingLevelUp = null;
    },
  },
});

export const { openModal, closeModal, setPendingLevelUp, clearPendingLevelUp } =
  modalSlice.actions;

export const selectModal = (state) => state.modal;
export const selectPendingLevelUp = (state) =>
  state.modal?.pendingLevelUp ?? null;

export default modalSlice.reducer;
