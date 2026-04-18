"use client";
import FromContainer from "@/app/[locale]/components/container/FromContainer";
import Logo from "@/app/[locale]/components/elements/Logo";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";
import { supabaseClient } from "@/app/[locale]/lib/supabase/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const formConfig = [
  {
    id: "password",
    name: "password",
    label: "New Password",
    type: "password",
    placeholder: "Enter new password",
    autoComplete: "new-password",
    wrapperClassName: "sm:col-span-2",
  },
  {
    id: "confirmPassword",
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "Repeat new password",
    autoComplete: "new-password",
    wrapperClassName: "sm:col-span-2",
  },
];

const UpdatePasswordPage = () => {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const dispatch = useDispatch();
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionVerified, setSessionVerified] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") || "";
      const type = hashParams.get("type");
      if (accessToken && type === "recovery") {
        const { error } = await supabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) {
          setSessionVerified(true);
          return;
        }
      }
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } =
          await supabaseClient.auth.exchangeCodeForSession(code);
        if (!error) {
          setSessionVerified(true);
          return;
        }
      }
      const { data } = await supabaseClient.auth.getSession();
      if (data?.session) {
        setSessionVerified(true);
        return;
      }
      dispatch(
        setToast({
          type: "error",
          msg: "Invalid or expired reset link. Please request a new one.",
        }),
      );
      router.replace(`/${locale}/reset-password`);
    };
    verifySession();
  }, [dispatch, locale, router]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearToast());
    if (!sessionVerified) {
      dispatch(
        setToast({
          type: "error",
          msg: "Session not verified. Please request a new reset link.",
        }),
      );
      return;
    }
    if (form.password.length < 6) {
      dispatch(
        setToast({
          type: "error",
          msg: "Password must be at least 6 characters.",
        }),
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      dispatch(setToast({ type: "error", msg: "Passwords do not match." }));
      return;
    }
    try {
      setIsSubmitting(true);
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        dispatch(
          setToast({
            type: "error",
            msg: "Session expired. Please request a new reset link.",
          }),
        );
        return;
      }
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: form.password }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update password.");
      }
      await supabaseClient.auth.signOut();
      dispatch(
        setToast({
          type: "success",
          msg: "Password updated successfully. Please log in.",
        }),
      );
      router.push(`/${locale}/login`);
    } catch (err) {
      dispatch(
        setToast({
          type: "error",
          msg:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred.",
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionVerified) {
    return (
      <main className="min-h-screen bg-black px-4 center flex-col">
        <p className="secondary text-sm text-white/40">Verifying reset link…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 center flex-col space-y-10 pb-20">
      <Logo size="large" />
      <FromContainer
        title="New Password"
        subtitle="Choose a strong new password for your account."
        onSubmit={handleSubmit}
        submitLabel="Update Password"
        submittingLabel="Updating…"
        isSubmitting={isSubmitting}
        passwordValue={form.password}
        fields={formConfig}
        values={form}
        onFieldChange={handleChange}
        fieldsWrapperClassName="grid gap-5 sm:grid-cols-2"
        maxWidthClass="w-full max-w-lg"
      />
    </main>
  );
};

export default UpdatePasswordPage;
