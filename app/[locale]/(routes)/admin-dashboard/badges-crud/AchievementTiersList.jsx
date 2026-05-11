"use client";
import React, { useState, useCallback, useMemo, useRef } from "react";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import ToggleButton from "@/app/[locale]/components/buttons/ToggleButton";
import Input from "@/app/[locale]/components/forms/Input";
import UploadImageInput from "@/app/[locale]/components/forms/UploadImageInput";
import BadgeCard from "./BadgeCard";
import EditItemModal from "./EditItemModal";

const TIER_FIELDS = [
  { id: "level", name: "level", label: "Level", placeholder: "e.g. 1" },
  {
    id: "required_count",
    name: "required_count",
    label: "Required",
    placeholder: "# tasks",
  },
  {
    id: "title",
    name: "title",
    label: "Title",
    type: "text",
    placeholder: "e.g. Bronze",
  },
];

const EMPTY_TIER = {
  category_id: "",
  level: "",
  title: "",
  required_count: "",
  icon: null,
  _iconFile: null,
};

const AchievementTiersList = ({
  categories,
  tiers,
  loading,
  savingId,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [newTier, setNewTier] = useState(EMPTY_TIER);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const editTargetRef = useRef(null);

  /* Derive the effective selected ID without setState in an effect */
  const categoryToggleOptions = useMemo(
    () => categories.map((c) => ({ label: c.label, value: String(c.id) })),
    [categories],
  );

  const effectiveSelectedId = useMemo(() => {
    if (selectedCategoryId) return selectedCategoryId;
    const exploration = categories.find(
      (c) => String(c.label || "").toLowerCase() === "exploration",
    );
    return String(exploration?.id ?? categories[0]?.id ?? "");
  }, [selectedCategoryId, categories]);

  /* filter tiers by selected category */
  const filteredTiers = useMemo(() => {
    const id = Number(effectiveSelectedId);
    if (!id) return [];
    return tiers.filter((t) => t.category_id === id);
  }, [tiers, effectiveSelectedId]);

  /* ── new tier form ── */
  const handleNewInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewTier((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNewIconChange = useCallback((file) => {
    setNewTier((prev) => ({ ...prev, _iconFile: file }));
  }, []);

  const handleAddSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await onCreate({
        ...newTier,
        category_id: newTier.category_id || effectiveSelectedId,
      });
      setNewTier((prev) => ({ ...EMPTY_TIER, category_id: prev.category_id }));
    },
    [newTier, effectiveSelectedId, onCreate],
  );

  /* ── edit modal ── */
  const openEdit = useCallback((tier) => {
    editTargetRef.current = tier;
    setEditTarget(tier);
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

  const isAddingSaving = savingId === "new-tier";

  return (
    <div className="space-y-6">
      {/* ── Add form ── */}
      <div className="space-y-3">
        <SectionHeadline
          title="Add Achievement Tier"
          subtitle="Create new achievement tiers linked to a task category."
        />
        <ToggleButton
          size="sm"
          variant="layout"
          options={categoryToggleOptions}
          value={String(newTier.category_id || effectiveSelectedId)}
          onChange={(val) =>
            setNewTier((prev) => ({ ...prev, category_id: val }))
          }
        />
        <ItemCard className="space-y-4 w-full lg:w-2/6">
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid gap-3 grid-cols-3">
              {TIER_FIELDS.map((field) => (
                <Input
                  key={field.id}
                  data={{
                    ...field,
                    id: `new-tier-${field.id}`,
                    name: field.id,
                  }}
                  value={newTier[field.id] ?? ""}
                  onChange={handleNewInputChange}
                  disabled={isAddingSaving}
                />
              ))}
            </div>
            <UploadImageInput
              value={newTier.icon}
              onChange={handleNewIconChange}
              label="Icon"
              disabled={isAddingSaving}
            />
            <Button
              size="sm"
              text={isAddingSaving ? "Adding…" : "Add Tier"}
              type="submit"
              disabled={isAddingSaving}
            />
          </form>
        </ItemCard>
      </div>

      {/* ── Existing tiers list ── */}
      <div className="space-y-3">
        <SectionHeadline
          title="Existing Achievement Tiers"
          subtitle="Browse tiers by category and edit them."
        />

        {/* Category filter — ToggleButton layout variant */}
        <div className="flex items-center gap-3 flex-wrap">
          <ToggleButton
            size="sm"
            variant="layout"
            options={categoryToggleOptions}
            value={effectiveSelectedId}
            onChange={(val) => setSelectedCategoryId(val)}
          />
        </div>

        {loading ? (
          <p className="secondary text-sm text-chino/60">Loading tiers…</p>
        ) : filteredTiers.length === 0 ? (
          <p className="secondary text-sm text-chino/40">
            No tiers for this category yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTiers.map((tier) => (
              <BadgeCard
                key={tier.id}
                image={tier.icon}
                title={tier.title}
                subtitle={
                  categories.find((c) => c.id === tier.category_id)?.label
                }
                meta={[
                  { label: "Level", value: tier.level },
                  { label: "Required", value: tier.required_count },
                ]}
                onEdit={() => openEdit(tier)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Edit modal ── */}
      {editTarget && (
        <EditItemModal
          title="Edit Achievement Tier"
          initial={editTarget}
          fields={TIER_FIELDS}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeEdit}
          saving={savingId === `tier-${editTarget.id}`}
        />
      )}
    </div>
  );
};

export default AchievementTiersList;
