"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";
import FromContainer from "@/app/[locale]/components/container/FromContainer";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";

const FIELDS = [
  {
    id: "currentPassword",
    name: "currentPassword",
    label: "Current Password",
    type: "password",
    placeholder: "Enter current password",
    autoComplete: "current-password",
    wrapperClassName: "sm:col-span-2",
  },
  {
    id: "newPassword",
    name: "newPassword",
    label: "New Password",
    type: "password",
    placeholder: "Enter new password",
    autoComplete: "new-password",
    wrapperClassName: "sm:col-span-2",
  },
  {
    id: "confirmPassword",
    name: "confirmPassword",
    label: "Confirm New Password",
    type: "password",
    placeholder: "Repeat new password",
    autoComplete: "new-password",
    wrapperClassName: "sm:col-span-2",
  },
];

const ChangePassword = () => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearToast());
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      dispatch(setToast({ type: "error", msg: "All fields are required." }));
      return;
    }
    if (form.newPassword.length < 6) {
      dispatch(
        setToast({
          type: "error",
          msg: "New password must be at least 6 characters.",
        }),
      );
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      dispatch(setToast({ type: "error", msg: "New passwords do not match." }));
      return;
    }
    if (form.currentPassword === form.newPassword) {
      dispatch(
        setToast({
          type: "error",
          msg: "New password must differ from current password.",
        }),
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password.");
      dispatch(
        setToast({ type: "success", msg: "Password changed successfully." }),
      );
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      dispatch(
        setToast({
          type: "error",
          msg:
            err instanceof Error ? err.message : "Failed to change password.",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <SectionHeadline
        title="Change Password"
        subtitle="Update your account password."
      />
      <FromContainer
        onSubmit={handleSubmit}
        submitLabel="Change Password"
        submittingLabel="Changing..."
        isSubmitting={loading}
        fields={FIELDS}
        values={form}
        onFieldChange={handleChange}
        passwordValue={form.newPassword}
        fieldsWrapperClassName="grid gap-4 sm:grid-cols-2"
        maxWidthClass="w-full"
      />
    </div>
  );
};

export default ChangePassword;
