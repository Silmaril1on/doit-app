"use client";

import FromContainer from "@/app/[locale]/components/container/FromContainer";
import Logo from "@/app/[locale]/components/elements/Logo";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";

const formConfig = [
  {
    id: "email",
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your account email",
    autoComplete: "email",
    wrapperClassName: "sm:col-span-2",
  },
];

const ResetPasswordPage = () => {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const dispatch = useDispatch();
  const router = useRouter();
  const [form, setForm] = useState({ email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearToast());

    const email = form.email.trim().toLowerCase();
    if (!email) {
      dispatch(setToast({ type: "error", msg: "Email is required." }));
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email.");
      }

      setSent(true);
      dispatch(
        setToast({
          type: "success",
          msg: "Check your email for the reset link.",
        }),
      );
      router.push(`/${locale}/login`);
    } catch (err) {
      dispatch(
        setToast({
          type: "error",
          msg:
            err instanceof Error ? err.message : "Failed to send reset email.",
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 center flex-col space-y-10 pb-20">
      <Logo size="large" />
      <FromContainer
        title="Reset Password"
        subtitle="Enter your account email and we'll send you a reset link."
        onSubmit={handleSubmit}
        submitLabel={sent ? "Email Sent" : "Send Reset Link"}
        submittingLabel="Sending…"
        isSubmitting={isSubmitting}
        submitDisabled={sent}
        fields={formConfig}
        values={form}
        onFieldChange={handleChange}
        fieldsWrapperClassName="grid gap-5 sm:grid-cols-2"
        maxWidthClass="w-full max-w-lg"
        footerText="Remembered your password?"
        footerLinkLabel="Login"
        footerLinkHref={`/${locale}/login`}
      />
    </main>
  );
};

export default ResetPasswordPage;
