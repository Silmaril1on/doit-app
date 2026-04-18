"use client";
import Button from "@/app/[locale]/components/buttons/Button";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";

const VerifyEmail = ({ user }) => {
  const dispatch = useDispatch();
  const [emailVerified, setEmailVerified] = useState(
    user?.email_verified ?? false,
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    dispatch(clearToast());
    setSending(true);
    try {
      const res = await fetch("/api/auth/verify-email", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send.");
      setSent(true);
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
          msg:
            err instanceof Error
              ? err.message
              : "Failed to send verification email.",
        }),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-2">
      <SectionHeadline
        title="Email Verification"
        subtitle="Manage your email verification settings."
      />
      <ItemCard className="flex justify-between items-center">
        <div className="space-y-1 leading-none *:leading-none">
          <p className="secondary text-[10px] uppercase tracking-[0.16em] text-cream/80 ">
            Email Address
          </p>
          <p className="secondary text-md text-cream leading-none mt-3">
            {user?.email ?? ""}
          </p>
          {emailVerified === null ? (
            <span className="secondary text-[10px] text-white/30 uppercase tracking-widest">
              Checking...
            </span>
          ) : emailVerified ? (
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
          <Button
            variant="outline"
            text={sending ? "Sending..." : sent ? "Email Sent" : "Verify Email"}
            onClick={handleSend}
            disabled={sending || sent}
          />
        )}
      </ItemCard>
    </div>
  );
};

export default VerifyEmail;
