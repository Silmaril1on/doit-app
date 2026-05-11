"use client";
import React, { useState, useCallback, useRef } from "react";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import Input from "@/app/[locale]/components/forms/Input";
import UploadImageInput from "@/app/[locale]/components/forms/UploadImageInput";
import BadgeCard from "./BadgeCard";
import EditItemModal from "./EditItemModal";

const CAT_FIELDS = [
  {
    id: "label",
    name: "label",
    label: "Label",
    type: "text",
    placeholder: "e.g. Exploration",
  },
  {
    id: "description",
    name: "description",
    label: "Description",
    type: "text",
    placeholder: "Optional description",
  },
];

const EMPTY_CATEGORY = {
  label: "",
  description: "",
  icon: null,
  _iconFile: null,
};

const TaskCategoriesList = ({
  categories,
  loading,
  savingId,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [newCategory, setNewCategory] = useState(EMPTY_CATEGORY);
  const [editTarget, setEditTarget] = useState(null);
  const editTargetRef = useRef(null);

  /* ── new category form ── */
  const handleNewInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNewIconChange = useCallback((file) => {
    setNewCategory((prev) => ({ ...prev, _iconFile: file }));
  }, []);

  const handleAddSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await onCreate(newCategory);
      setNewCategory(EMPTY_CATEGORY);
    },
    [newCategory, onCreate],
  );

  /* ── edit modal ── */
  const openEdit = useCallback((cat) => {
    editTargetRef.current = cat;
    setEditTarget(cat);
  }, []);

  const closeEdit = useCallback(() => {
    editTargetRef.current = null;
    setEditTarget(null);
  }, []);

  const handleSave = useCallback(
    async (draft) => {
      const id = editTargetRef.current?.id;
      if (!id) return;
      await onUpdate(id, draft);
      editTargetRef.current = null;
      setEditTarget(null);
    },
    [onUpdate],
  );

  const handleDelete = useCallback(async () => {
    const id = editTargetRef.current?.id;
    if (!id) return;
    await onDelete(id);
    editTargetRef.current = null;
    setEditTarget(null);
  }, [onDelete]);

  const isAddingSaving = savingId === "new-category";

  return (
    <div className="space-y-6">
      {/* ── Add form ── */}
      <div className="space-y-3">
        <SectionHeadline
          title="Add Task Category"
          subtitle="Create a new category for organizing tasks and awarding badges."
        />
        <ItemCard className="space-y-4 w-full lg:w-2/6">
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid gap-2 grid-cols-1">
              {CAT_FIELDS.map((field) => (
                <Input
                  key={field.id}
                  data={{ ...field, id: `new-cat-${field.id}`, name: field.id }}
                  value={newCategory[field.id] ?? ""}
                  onChange={handleNewInputChange}
                  disabled={isAddingSaving}
                />
              ))}
            </div>
            <UploadImageInput
              value={newCategory.icon}
              onChange={handleNewIconChange}
              label="Icon"
              disabled={isAddingSaving}
            />
            <Button
              size="sm"
              text={isAddingSaving ? "Adding…" : "Add Category"}
              type="submit"
              disabled={isAddingSaving}
            />
          </form>
        </ItemCard>
      </div>

      {/* ── Existing list ── */}
      <div className="space-y-3">
        <SectionHeadline
          title="Existing Categories"
          subtitle="Manage your existing task categories."
        />

        {loading ? (
          <p className="secondary text-sm text-chino/60">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="secondary text-sm text-chino/40">No categories yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <BadgeCard
                key={cat.id}
                image={cat.icon}
                title={cat.label}
                subtitle={cat.description}
                onEdit={() => openEdit(cat)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Edit modal ── */}
      {editTarget && (
        <EditItemModal
          title="Edit Category"
          initial={editTarget}
          fields={CAT_FIELDS}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeEdit}
          saving={savingId === `cat-${editTarget.id}`}
        />
      )}
    </div>
  );
};

export default TaskCategoriesList;
