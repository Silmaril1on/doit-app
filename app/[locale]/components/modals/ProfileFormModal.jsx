"use client";

import { useEffect, useState } from "react";
import { mutate as mutateCache } from "swr";
import { useDispatch, useSelector } from "react-redux";
import SubmissionForm from "@/app/[locale]/components/forms/SubmissionForm";
import GlobalModal from "@/app/[locale]/components/modals/GlobalModal";
import CoverCatalog from "@/app/[locale]/components/modals/CoverCatalog";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";

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

const MODAL_TYPE = "editProfile";
const MODAL_FORM_ID = "edit-profile-form";

const createInitialForm = (profile) =>
  FIELDS.flatMap((row) => row.fields).reduce((acc, field) => {
    acc[field.key] = profile?.[field.key] ?? "";
    return acc;
  }, {});

const ProfileFormModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const isOpen = modalType === MODAL_TYPE;
  const profile = modalProps?.profile ?? null;

  const [form, setForm] = useState(() => createInitialForm(profile));
  const [imageFile, setImageFile] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null); // catalog URL
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm(createInitialForm(profile));
    setImageFile(null);
    setSelectedCover(null);
    setSubmitting(false);
    setError(null);
  }, [isOpen, profile]);

  const handleClose = () => {
    dispatch(closeModal());
    setSubmitting(false);
    setError(null);
    setSelectedCover(null);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
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

      // Catalog cover selection — PATCH with just the URL (no file upload needed)
      if (selectedCover) {
        const wallpaperRes = await fetch("/api/user/wallpaper", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: selectedCover }),
        });
        const wallpaperData = await wallpaperRes.json();
        if (!wallpaperRes.ok)
          throw new Error(wallpaperData.error || "Failed to set cover photo");
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
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Profile"
      maxWidth="max-w-3xl"
      formId={MODAL_FORM_ID}
      submitLabel={submitting ? "Saving..." : "Save Changes"}
      submitDisabled={submitting}
    >
      {error && (
        <p className="text-red-500 text-sm border border-red-500/30 bg-red-500/10 px-3 py-2">
          {error}
        </p>
      )}

      {/* Cover photo catalog — replaces the file upload input */}
      <CoverCatalog
        selected={selectedCover}
        onSelect={setSelectedCover}
        disabled={submitting}
      />

      {/* Profile fields + avatar upload (no wallpaperField — handled by catalog above) */}
      <SubmissionForm
        fields={FIELDS}
        values={form}
        onChange={handleChange}
        disabled={submitting}
        formId={MODAL_FORM_ID}
        onSubmit={handleSubmit}
        imageField={{
          value: profile?.image_url ?? null,
          onChange: setImageFile,
        }}
      />
    </GlobalModal>
  );
};

export default ProfileFormModal;
