"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { mutate as globalMutate } from "swr";
import GlobalModal from "./GlobalModal";
import ProgressBar from "../elements/ProgressBar";
import Button from "../buttons/Button";
import { useModal } from "@/app/[locale]/lib/hooks/useModal";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";

export const ACCOUNT_VERIFICATION_MODAL = "accountVerification";

const PROFILE_FIELDS = [
  { key: "first_name", label: "First Name", type: "text" },
  { key: "last_name", label: "Last Name", type: "text" },
  { key: "country", label: "Country", type: "text" },
  { key: "city", label: "City", type: "text" },
  { key: "zip", label: "ZIP Code", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "phone_number", label: "Phone Number", type: "text" },
  { key: "date", label: "Date of Birth", type: "date" },
  {
    key: "sex",
    label: "Sex",
    type: "select",
    options: ["", "Male", "Female", "Other"],
  },
];

// 10 total: email_verified + 9 profile fields
const TOTAL_FIELDS = PROFILE_FIELDS.length + 1;

// Grouped layout rows: [cols, fields[]]
const FIELD_ROWS = [
  [2, ["first_name", "last_name"]],
  [3, ["country", "city", "zip"]],
  [2, ["address", "phone_number"]],
  [2, ["sex", "date"]],
];

function calcProgress(form, emailVerified) {
  let filled = emailVerified ? 1 : 0;
  for (const { key } of PROFILE_FIELDS) {
    if (form[key] && String(form[key]).trim()) filled++;
  }
  return Math.round((filled / TOTAL_FIELDS) * 100);
}

const AccountVerificationModal = () => {
  const dispatch = useDispatch();
  const { modalType, close } = useModal();
  const isOpen = modalType === ACCOUNT_VERIFICATION_MODAL;

  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState({});
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setLoading(true);
      setEmailSent(false);
      try {
        const [profileRes, verifyRes] = await Promise.all([
          fetch("/api/user/profile/single-profile"),
          fetch("/api/auth/verify-email"),
        ]);
        const profileData = profileRes.ok ? await profileRes.json() : {};
        const verifyData = verifyRes.ok ? await verifyRes.json() : {};

        const profile = profileData.profile ?? {};
        const verified = verifyData.email_verified ?? false;

        setEmailVerified(verified);
        setUserEmail(verifyData.email || profile.email || "");
        setForm(
          PROFILE_FIELDS.reduce((acc, { key }) => {
            acc[key] = profile[key] ?? "";
            return acc;
          }, {}),
        );
        setStep(verified ? 2 : 1);
      } catch {
        // silent — GlobalModal will stay in non-error state
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen]);

  const progress = calcProgress(form, emailVerified);

  const handleSendVerification = async () => {
    dispatch(clearToast());
    setSending(true);
    try {
      const res = await fetch("/api/auth/verify-email", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send.");
      setEmailSent(true);
      dispatch(
        setToast({
          type: "success",
          msg: "Verification email sent! Check your inbox.",
        }),
      );
    } catch (err) {
      dispatch(
        setToast({
          type: "error",
          msg: err instanceof Error ? err.message : "Failed to send.",
        }),
      );
    } finally {
      setSending(false);
    }
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = async () => {
    dispatch(clearToast());
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      globalMutate("/api/user/profile/single-profile");
      dispatch(
        setToast({ type: "success", msg: "Profile updated successfully." }),
      );
      close();
    } catch (err) {
      dispatch(
        setToast({
          type: "error",
          msg: err instanceof Error ? err.message : "Failed to save profile.",
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldMap = Object.fromEntries(PROFILE_FIELDS.map((f) => [f.key, f]));

  const renderField = (key) => {
    const field = fieldMap[key];
    if (!field) return null;
    return (
      <div key={field.key}>
        <label htmlFor={`avf-${field.key}`}>{field.label}</label>
        {field.type === "select" ? (
          <select
            id={`avf-${field.key}`}
            value={form[field.key] ?? ""}
            onChange={handleChange(field.key)}
            disabled={submitting}
          >
            {field.options.map((o) => (
              <option key={o} value={o}>
                {o || "Select..."}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`avf-${field.key}`}
            type={field.type}
            value={form[field.key] ?? ""}
            onChange={handleChange(field.key)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            disabled={submitting}
          />
        )}
      </div>
    );
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={close}
      title="Verify Account"
      maxWidth="max-w-2xl"
      isLoading={loading}
      footerMode="custom"
    >
      <div className="mt-5 space-y-6">
        {/* Progress bar */}
        <ProgressBar value={progress} max={100} label="Profile Completion" />

        {/* Step indicators */}
        <div className="relative flex items-center">
          {/* connector line */}
          <div className="absolute left-0 right-0 top-4 h-px bg-teal-500/15 z-0" />

          {[
            { num: 1, label: "Email Verification", done: emailVerified },
            { num: 2, label: "Profile Info", done: false },
          ].map(({ num, label, done }) => {
            const isActive = step === num;
            const isPast = step > num;
            return (
              <div
                key={num}
                className="relative z-10 flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-colors duration-300 ${
                    isActive
                      ? "border-teal-500 bg-teal-500 text-black"
                      : isPast || done
                        ? "border-teal-500/60 bg-teal-500/20 text-teal-400"
                        : "border-white/15 bg-black/40 text-white/30"
                  }`}
                >
                  {isPast || (done && !isActive) ? (
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8l3.5 3.5L13 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    num
                  )}
                </div>
                <p
                  className={`secondary text-[10px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                    isActive
                      ? "text-teal-400"
                      : isPast || done
                        ? "text-teal-400/60"
                        : "text-white/25"
                  }`}
                >
                  {label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Step 1 — email verification */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-teal-500/20 bg-teal-400/10 p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <p className="secondary text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Email Address
                </p>
                <p className="primary text-sm text-cream">{userEmail}</p>
                {emailVerified ? (
                  <span className="secondary text-[10px] uppercase tracking-widest text-teal-400">
                    Verified
                  </span>
                ) : (
                  <span className="secondary text-[10px] uppercase tracking-widest text-red-400">
                    Not Verified
                  </span>
                )}
              </div>

              {!emailVerified && (
                <button
                  onClick={handleSendVerification}
                  disabled={sending || emailSent}
                  className="secondary text-[10px] uppercase tracking-[0.14em] border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 px-4 py-2 rounded-lg"
                >
                  {sending
                    ? "Sending..."
                    : emailSent
                      ? "Email Sent"
                      : "Verify Email"}
                </button>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                text="Next →"
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
              />
            </div>
          </div>
        )}

        {/* Step 2 — profile fields */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-3">
              {FIELD_ROWS.map(([cols, keys]) => (
                <div
                  key={keys.join("-")}
                  className={`grid gap-3 grid-cols-${cols}`}
                >
                  {keys.map((key) => renderField(key))}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              {!emailVerified ? (
                <button
                  onClick={() => setStep(1)}
                  className="secondary text-[10px] uppercase tracking-[0.14em] text-white/40 hover:text-teal-400 transition-colors duration-200"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={close}
                  disabled={submitting}
                  className="secondary text-[10px] uppercase tracking-[0.14em] text-white/30 hover:text-white/60 disabled:opacity-40 transition-colors duration-200"
                >
                  Skip
                </button>
                <Button
                  text="Save Profile"
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={submitting}
                  loading={submitting}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </GlobalModal>
  );
};

export default AccountVerificationModal;
