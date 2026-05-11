"use client";
import React, { useState, useCallback } from "react";
import GlobalModal from "@/app/[locale]/components/modals/GlobalModal";
import Button from "@/app/[locale]/components/buttons/Button";
import Input from "@/app/[locale]/components/forms/Input";
import UploadImageInput from "@/app/[locale]/components/forms/UploadImageInput";

const EditItemModal = ({
  title,
  initial,
  fields,
  onSave,
  onDelete,
  onClose,
  saving,
}) => {
  const [draft, setDraft] = useState({ ...initial });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleIconChange = useCallback((file) => {
    // Store the raw File; the parent will upload it during onSave
    setDraft((prev) => ({ ...prev, _iconFile: file }));
  }, []);

  return (
    <GlobalModal
      isOpen
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footerMode="none"
    >
      {/* fields */}
      <div className="space-y-3 mt-4">
        {fields.map((field) => (
          <Input
            key={field.id}
            data={{ ...field, id: `edit-${field.id}`, name: field.id }}
            value={draft[field.id] ?? ""}
            onChange={handleChange}
            disabled={saving}
          />
        ))}

        <UploadImageInput
          value={draft.icon ?? null}
          onChange={handleIconChange}
          label="Icon"
          disabled={saving}
        />
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 pt-4">
        <Button
          text={saving ? "Saving…" : "Save"}
          size="sm"
          onClick={() => onSave(draft)}
          disabled={saving}
        />
        <Button
          variant="outline"
          text="Delete"
          size="sm"
          onClick={onDelete}
          disabled={saving}
        />
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="ml-auto secondary text-xs text-chino/50 hover:text-chino transition-colors duration-150 cursor-pointer disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </GlobalModal>
  );
};

export default EditItemModal;
