"use client";

import FromContainer from "@/app/[locale]/components/container/FromContainer";
import Logo from "@/app/[locale]/components/elements/Logo";
import GoogleAuth from "@/app/[locale]/components/buttons/GoogleAuth";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";
import { setUser } from "@/app/[locale]/lib/features/userSlice";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

const userFormConfig = [
  {
    id: "email",
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter email",
    autoComplete: "email",
    wrapperClassName: "sm:col-span-2",
  },
  {
    id: "password",
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter password",
    autoComplete: "current-password",
    wrapperClassName: "sm:col-span-2",
  },
];

const LoginPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();

    dispatch(clearToast());

    if (!email || !form.password) {
      dispatch(
        setToast({ type: "error", msg: "Email and password are required." }),
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      dispatch(setToast({ type: "success", msg: "Logged in successfully." }));

      dispatch(setUser(data.user));

      router.push(`/${locale}`);
    } catch (submitError) {
      dispatch(
        setToast({
          type: "error",
          msg:
            submitError instanceof Error ? submitError.message : "Login failed",
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
        title="Login"
        onSubmit={handleSubmit}
        submitLabel="Login"
        submittingLabel="Signing In"
        isSubmitting={isSubmitting}
        fields={userFormConfig}
        values={form}
        onFieldChange={handleChange}
        fieldsWrapperClassName="grid gap-5 sm:grid-cols-2"
        maxWidthClass="w-full max-w-lg"
        oauthSlot={
          <div className="space-y-3">
            <GoogleAuth />
            <div className="text-center">
              <a
                href={`/${locale}/reset-password`}
                className="secondary text-xs text-white/40 hover:text-teal-500 transition-colors duration-200 uppercase tracking-widest"
              >
                Forgot your password?
              </a>
            </div>
          </div>
        }
        footerText="Don't have an account?"
        footerLinkLabel="Register"
        footerLinkHref={`/${locale}/register`}
      />
    </main>
  );
};

export default LoginPage;
