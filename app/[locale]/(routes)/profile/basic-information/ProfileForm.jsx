"use client";

import { useState } from "react";
import { mutate as mutateCache } from "swr";
import SubmissionForm from "@/app/[locale]/components/forms/SubmissionForm";

const FIELDS = [
  {
    cols: 2,
    fields: [
      { key: "first_name", label: "First Name", type: "text" },
      { key: "last_name", label: "Last Name", type: "text" },
    ],
  },
  {
    cols: 1,
    fields: [{ key: "display_name", label: "Display Name", type: "text" }],
  },
  {
    cols: 1,
    fields: [
      {
        key: "sex",
        label: "Sex",
        type: "select",
        options: ["", "Male", "Female", "Other"],
      },
    ],
  },
  {
    cols: 3,
    fields: [
      { key: "phone_number", label: "Phone Number", type: "text" },
      { key: "address", label: "Address", type: "text" },
      { key: "zip", label: "ZIP Code", type: "text" },
    ],
  },
  {
    cols: 3,
    fields: [
      { key: "country", label: "Country", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "date", label: "Date of Birth", type: "date" },
    ],
  },
];

const ProfileForm = ({ profile, formId, onClose, onSubmittingChange }) => {
  const [form, setForm] = useState(
    FIELDS.flatMap((row) => row.fields).reduce((acc, field) => {
      acc[field.key] = profile?.[field.key] ?? "";
      return acc;
    }, {}),
  );
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const setSubmittingState = (value) => {
    setSubmitting(value);
    onSubmittingChange?.(value);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmittingState(true);
    setError(null);

    try {
      // Upload avatar first if a new image was selected
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);

        const avatarRes = await fetch("/api/user/avatar", {
          method: "POST",
          body: fd,
        });
        const avatarData = await avatarRes.json();
        if (!avatarRes.ok)
          throw new Error(avatarData.error || "Failed to upload avatar");
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Failed to update profile");

      await mutateCache("/api/user/profile/single-profile");
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSubmittingState(false);
    }
  };

  return (
    <div className="space-y-3 border">
      {error && (
        <p className="text-red-500 text-sm border border-red-500/30 bg-red-500/10 px-3 py-2">
          {error}
        </p>
      )}

      <form id={formId} onSubmit={handleSubmit}>
        <SubmissionForm
          fields={FIELDS}
          values={form}
          onChange={handleChange}
          disabled={submitting}
          imageField={{
            value: profile?.image_url ?? null,
            onChange: setImageFile,
          }}
        />
      </form>
    </div>
  );
};

export default ProfileForm;
