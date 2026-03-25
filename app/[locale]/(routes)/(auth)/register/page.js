"use client";
import FromContainer from "@/app/[locale]/components/container/FromContainer";
import { setUser } from "@/app/[locale]/lib/features/userSlice";
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
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();

    setError("");
    setSuccessMessage("");

    if (!username || !email || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
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
          username,
          email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      dispatch(
        setUser({
          id: data.user.id,
          display_name: data.user.display_name,
          email: data.user.email,
        }),
      );

      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setSuccessMessage("Account created successfully.");
      router.push(`/${locale}/`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Registration failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 center pb-20">
      <FromContainer
        title="Sign Up"
        onSubmit={handleSubmit}
        submitLabel="Create Account"
        submittingLabel="Creating Account"
        isSubmitting={isSubmitting}
        error={error}
        successMessage={successMessage}
        fields={userFormConfig}
        values={form}
        onFieldChange={handleChange}
        fieldsWrapperClassName="grid gap-5 sm:grid-cols-2"
        maxWidthClass="max-w-xl"
        footerText="Already registered?"
        footerLinkLabel="Login"
        footerLinkHref={`/${locale}/login`}
      />
    </main>
  );
};

export default RegistrationPage;
