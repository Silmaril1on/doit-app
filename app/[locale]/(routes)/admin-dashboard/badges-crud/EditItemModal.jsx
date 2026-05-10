"use client";
import React, { useState, useCallback } from "react";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
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
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <ItemCard className="w-full max-w-md space-y-5">
        {/* header */}
        <div className="flex items-center justify-between">
          <p className="primary text-cream font-semibold text-base">{title}</p>
          <ActionButton variant="close" onClick={onClose} />
        </div>

        {/* fields */}
        <div className="space-y-3">
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
        <div className="flex items-center gap-2 pt-1">
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
      </ItemCard>
    </div>
  );
};

export default EditItemModal;
