"use client";
import FromContainer from "@/app/[locale]/components/container/FromContainer";
import Logo from "@/app/[locale]/components/elements/Logo";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";
import { setUser } from "@/app/[locale]/lib/features/userSlice";
import {
  getPasswordStrength,
  validateRegistrationForm,
} from "@/app/[locale]/lib/utils/regValidation";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

const userFormConfig = [
  {
    id: "username",
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "Enter username",
    autoComplete: "username",
    wrapperClassName: "sm:col-span-2",
  },
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
    autoComplete: "new-password",
  },
  {
    id: "confirm-password",
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "Repeat password",
    autoComplete: "new-password",
  },
];

const RegistrationPage = () => {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const dispatch = useDispatch();
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldShowPasswordStrength = form.password.length > 0;
  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    dispatch(clearToast());

    const validation = validateRegistrationForm(form);
    if (!validation.isValid) {
      dispatch(
        setToast({
          type: "error",
          msg: validation.errorMessage,
        }),
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: validation.cleanedData.username,
          email: validation.cleanedData.email,
          password: validation.cleanedData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      dispatch(
        setToast({ type: "success", msg: "Account created successfully." }),
      );

      dispatch(setUser(data.user));

      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      router.push(`/${locale}/`);
    } catch (submitError) {
      dispatch(
        setToast({
          type: "error",
          msg:
            submitError instanceof Error
              ? submitError.message
              : "Registration failed",
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
        title="Sign Up"
        subtitle="Create your account with a secure password and start organizing your goals."
        onSubmit={handleSubmit}
        submitLabel="Create Account"
        submittingLabel="Creating Account"
        isSubmitting={isSubmitting}
        formExtras={
          shouldShowPasswordStrength ? (
            <div className="rounded-xl border border-teal-500/25 bg-black/45 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="secondary text-xs uppercase tracking-[0.16em] text-white/65">
                  Password Strength
                </p>
                <p className={`primary text-sm ${passwordStrength.textClass}`}>
                  {passwordStrength.label}
                </p>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <span
                    key={step}
                    className={`h-1.5 rounded-full ${
                      passwordStrength.score >= step
                        ? passwordStrength.barClass
                        : "bg-white/15"
                    }`}
                  />
                ))}
              </div>
              <p className="secondary mt-2 text-xs text-white/70">
                {passwordStrength.hint}
              </p>
            </div>
          ) : null
        }
        fields={userFormConfig}
        values={form}
        onFieldChange={handleChange}
        fieldsWrapperClassName="grid gap-5 sm:grid-cols-2"
        maxWidthClass="w-full max-w-xl"
        footerText="Already registered?"
        footerLinkLabel="Login"
        footerLinkHref={`/${locale}/login`}
      />
    </main>
  );
};

export default RegistrationPage;
