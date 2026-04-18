"use client";
import FromContainer from "@/app/[locale]/components/container/FromContainer";
import Logo from "@/app/[locale]/components/elements/Logo";
import GoogleAuth from "@/app/[locale]/components/buttons/GoogleAuth";
import { useState } from "react";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";
import { setUser } from "@/app/[locale]/lib/features/userSlice";
import { validateRegistrationForm } from "@/app/[locale]/lib/utils/regValidation";
import { useParams, useRouter } from "next/navigation";
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
        passwordValue={form.password}
        fields={userFormConfig}
        values={form}
        onFieldChange={handleChange}
        fieldsWrapperClassName="grid gap-5 sm:grid-cols-2"
        maxWidthClass="w-full max-w-xl"
        oauthSlot={<GoogleAuth />}
        footerText="Already registered?"
        footerLinkLabel="Login"
        footerLinkHref={`/${locale}/login`}
      />
    </main>
  );
};

export default RegistrationPage;
