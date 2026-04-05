"use client";

import { AnimatePresence, motion } from "framer-motion";
import ActionButton from "../buttons/ActionButton";
import Button from "../buttons/Button";
import BorderSvg from "../elements/BorderSvg";

const GlobalModal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-xl",
  formId,
  submitLabel = "Submit",
  submitDisabled = false,
  footerMode = "submit",
}) => {
  const isSubmitFooter = footerMode === "submit";
  const isCloseFooter = footerMode === "close";
  const shouldRenderFooter = isSubmitFooter || isCloseFooter;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full  ${maxWidth}`}
          >
            {/* FromContainer-style card */}
            <div className="relative bg-teal-400/10 backdrop-blur-lg overflow-hidden rounded-lg border border-teal-500/20 p-6">
              <BorderSvg strokeWidth={1} fadeAt={0.7} />
              <div className="absolute left-0 top-0 w-[40%] h-[30%] rounded-full bg-teal-500/40 blur-[90px] pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between gap-2 relative z-10">
                <h1 className="primary text-4xl uppercase leading-none text-teal-500">
                  {title}
                </h1>
                <ActionButton variant="close" onClick={onClose} />
              </div>

              {/* Content */}
              <div>{children}</div>

              {/* Footer */}
              {shouldRenderFooter ? (
                <div className="flex items-center justify-end pt-4 relative z-10">
                  <Button
                    type={isSubmitFooter ? "submit" : "button"}
                    variant="outline"
                    form={isSubmitFooter ? formId : undefined}
                    disabled={isSubmitFooter ? submitDisabled : false}
                    onClick={isCloseFooter ? onClose : undefined}
                    text={submitLabel}
                  />
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalModal;
