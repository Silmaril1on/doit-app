"use client";

import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";
import { MdClose } from "react-icons/md";
import ProfileForm from "@/app/[locale]/(routes)/profile/basic-information/ProfileForm";
import ItemCard from "../container/ItemCard";
import ActionButton from "../buttons/ActionButton";
import Button from "../buttons/Button";

const MODAL_FORM_ID = "global-modal-form";

// Registry: { component, title, submitLabel? }
const MODAL_REGISTRY = {
  editProfile: {
    component: ProfileForm,
    title: "Edit Profile",
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
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
            <ItemCard className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-cream font-bold text-xl">{entry.title}</h2>
                <ActionButton icon={<MdClose />} onClick={handleClose} />
              </div>

              {/* Content */}
              <ModalContent
                {...modalProps}
                formId={MODAL_FORM_ID}
                onClose={handleClose}
                onSubmittingChange={setSubmitting}
              />

              {/* Footer */}
              <div className="flex items-center justify-end pt-1">
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
            </ItemCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalModal;
