"use client";

import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";

import ProfileForm from "@/app/[locale]/(routes)/profile/basic-information/ProfileForm";
import ObjectiveSubmissionForm from "@/app/[locale]/(routes)/(tasks)/tasks/(componets)/ObjectiveSubmissionForm";
import ActionButton from "../buttons/ActionButton";
import Button from "../buttons/Button";
import BorderSvg from "../elements/BorderSvg";

const MODAL_FORM_ID = "global-modal-form";

// Registry: { component, title, submitLabel? }
const MODAL_REGISTRY = {
  editProfile: {
    component: ProfileForm,
    title: "Edit Profile",
    submitLabel: "Save Changes",
  },
  createObjective: {
    component: ObjectiveSubmissionForm,
    title: "Start New Quest",
    submitLabel: "Start New Quest",
  },
  editObjective: {
    component: ObjectiveSubmissionForm,
    title: "Edit Objective",
    submitLabel: "Save Changes",
  },
};

const GlobalModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const [submitting, setSubmitting] = useState(false);

  const entry = modalType ? MODAL_REGISTRY[modalType] : null;
  const ModalContent = entry?.component ?? null;

  const handleClose = () => {
    dispatch(closeModal());
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {ModalContent && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl"
          >
            {/* FromContainer-style card */}
            <div className="relative bg-teal-400/10 backdrop-blur-lg overflow-hidden rounded-lg border border-teal-500/20 p-6">
              <BorderSvg strokeWidth={1} fadeAt={0.7} />
              <div className="absolute left-0 top-0 w-[40%] h-[30%] rounded-full bg-teal-500/30 blur-[90px] pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between gap-2 relative z-10">
                <h1 className="primary text-4xl uppercase leading-none text-teal-500">
                  {entry.title}
                </h1>
                <ActionButton variant="close" onClick={handleClose} />
              </div>

              {/* Content */}
              <div className="mt-6 space-y-4 relative z-10 h-125 overflow-y-auto pr-1">
                <ModalContent
                  {...modalProps}
                  formId={MODAL_FORM_ID}
                  onClose={handleClose}
                  onSubmittingChange={setSubmitting}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end pt-4 relative z-10">
                <Button
                  type="submit"
                  variant="outline"
                  form={MODAL_FORM_ID}
                  disabled={submitting}
                  text={
                    submitting ? "Saving..." : (entry.submitLabel ?? "Submit")
                  }
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalModal;
