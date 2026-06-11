"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectModal } from "@/app/[locale]/lib/features/modalSlice";
import { useModalActions } from "@/app/[locale]/lib/hooks/useModal";
import GlobalModal from "./GlobalModal";
import SubmissionForm from "@/app/[locale]/components/forms/SubmissionForm";

const CONFIGS = {
  contact: {
    title: "Contact Us",
    placeholder: "What would you like to tell us?",
    endpoint: "/api/feedbacks/contact-us",
    useJson: true,
  },
  report: {
    title: "Report a Bug",
    placeholder: "Describe the bug — what happened and how to reproduce it?",
    endpoint: "/api/feedbacks/report",
    useJson: false,
  },
  feedback: {
    title: "Send Feedback",
    placeholder: "Share your thoughts, ideas, or suggestions...",
    endpoint: "/api/feedbacks/feedback",
    useJson: true,
  },
};

const FORM_ID = "feedback-form";

const EMPTY_FORM = { title: "", content: "" };

const FeedbackModal = () => {
  const { modalType, modalProps } = useSelector(selectModal);
  const { close } = useModalActions();

  const isOpen = modalType === "feedback";
  const feedbackType = modalProps?.feedbackType ?? "contact";
  const config = CONFIGS[feedbackType] ?? CONFIGS.contact;

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fields = [
    {
      cols: 1,
      fields: [
        {
          key: "title",
          label: "Subject",
          type: "text",
          placeholder: "Brief subject...",
        },
      ],
    },
    {
      cols: 1,
      fields: [
        {
          key: "content",
          label: "Message",
          type: "textarea",
          rows: 5,
          placeholder: config.placeholder,
        },
      ],
    },
  ];

  const handleClose = () => {
    close();
    setTimeout(() => {
      setForm(EMPTY_FORM);
      setImageFile(null);
      setError(null);
      setSuccess(false);
    }, 300);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let res;
      if (config.useJson) {
        res = await fetch(config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title.trim(),
            content: form.content.trim(),
          }),
        });
      } else {
        const fd = new FormData();
        fd.append("title", form.title.trim());
        fd.append("content", form.content.trim());
        if (imageFile) fd.append("image", imageFile);
        res = await fetch(config.endpoint, { method: "POST", body: fd });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleClose}
      title={config.title}
      formId={FORM_ID}
      submitLabel={isLoading ? "Sending..." : "Send"}
      submitDisabled={isLoading}
      footerMode={success ? "close" : "submit"}
    >
      {success ? (
        <div className="py-12 flex flex-col items-center gap-3 text-center">
          <p className="text-3xl">✓</p>
          <p className="text-cream font-semibold">Thank you!</p>
          <p className="text-chino/70 secondary text-sm">
            Your message has been received. We&apos;ll get back to you soon.
          </p>
        </div>
      ) : (
        <>
          {error && (
            <p className="text-red-500 text-sm border border-red-500/30 bg-red-500/10 px-3 py-2 mb-2">
              {error}
            </p>
          )}
          <SubmissionForm
            fields={fields}
            values={form}
            onChange={handleChange}
            disabled={isLoading}
            formId={FORM_ID}
            onSubmit={handleSubmit}
            {...(feedbackType === "report" && {
              imageField: {
                value: null,
                onChange: setImageFile,
                label: "Bug Screenshot",
                ctaText: "Upload bug screenshot",
                changeText: "Change screenshot",
              },
            })}
          />
        </>
      )}
    </GlobalModal>
  );
};

export default FeedbackModal;
