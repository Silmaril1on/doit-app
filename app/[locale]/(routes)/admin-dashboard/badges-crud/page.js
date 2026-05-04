"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import Input from "@/app/[locale]/components/forms/Input";
import UploadImageInput from "@/app/[locale]/components/forms/UploadImageInput";
import { FaChevronDown } from "react-icons/fa";

// ── field configs ─────────────────────────────────────────────────────────────

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

const TIER_FIELDS = [
  {
    id: "level",
    name: "level",
    label: "Level",
    placeholder: "e.g. 1",
  },
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

const emptyCategory = {
  label: "",
  description: "",
  icon: null,
  _iconFile: null,
};
const emptyTier = {
  category_id: "",
  level: "",
  title: "",
  required_count: "",
  icon: null,
  _iconFile: null,
};

const fetchJson = async (url, options) => {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

// ── select wrapper ────────────────────────────────────────────────────────────

const StyledSelect = ({ id, value, onChange, disabled, children }) => (
  <div>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="appearance-none pr-9 w-full"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cream/80">
        <FaChevronDown size={10} />
      </span>
    </div>
  </div>
);

const parseFieldName = (name) => {
  const [group, idStr, field] = String(name || "").split(":");
  const id = Number(idStr);
  if (!group || !field || !Number.isFinite(id)) return null;
  return { group, id, field };
};

const CategoryCard = ({
  cat,
  fields,
  onFieldChange,
  onIconUpload,
  onSave,
  onDelete,
  saving,
  uploading,
}) => {
  const handleIconChange = useCallback(
    (file) => onIconUpload(cat.id, file),
    [cat.id, onIconUpload],
  );
  const handleSave = useCallback(() => onSave(cat.id), [cat.id, onSave]);
  const handleDelete = useCallback(() => onDelete(cat.id), [cat.id, onDelete]);

  return (
    <ItemCard className="space-y-3">
      <div className="grid gap-2 grid-cols-2">
        {fields.map((field) => (
          <Input
            key={field.id}
            data={{
              ...field,
              id: `cat-${cat.id}-${field.id}`,
              name: `cat:${cat.id}:${field.id}`,
              label: field.label,
            }}
            value={cat[field.id] ?? ""}
            onChange={onFieldChange}
            disabled={saving}
          />
        ))}
      </div>
      <UploadImageInput
        value={cat.icon ?? null}
        onChange={handleIconChange}
        label="Icon"
        disabled={uploading || saving}
      />
      <div className="flex items-center gap-2">
        <Button
          text={saving ? "Saving..." : "Save"}
          size="sm"
          onClick={handleSave}
          disabled={saving}
        />
        <Button
          variant="outline"
          text="Delete Tier"
          size="sm"
          onClick={handleDelete}
          disabled={saving}
        />
      </div>
    </ItemCard>
  );
};

const TierCard = ({
  tier,
  fields,
  onFieldChange,
  onIconUpload,
  onSave,
  onDelete,
  saving,
  uploading,
}) => {
  const handleIconChange = useCallback(
    (file) => onIconUpload(tier.id, file),
    [tier.id, onIconUpload],
  );
  const handleSave = useCallback(() => onSave(tier.id), [tier.id, onSave]);
  const handleDelete = useCallback(
    () => onDelete(tier.id),
    [tier.id, onDelete],
  );

  return (
    <ItemCard className="space-y-3">
      <div className="grid gap-2 grid-cols-3">
        {fields.map((field) => (
          <Input
            key={field.id}
            data={{
              ...field,
              id: `tier-${tier.id}-${field.id}`,
              name: `tier:${tier.id}:${field.id}`,
              label: field.label,
            }}
            value={tier[field.id] ?? ""}
            onChange={onFieldChange}
            disabled={saving}
          />
        ))}
      </div>
      <UploadImageInput
        value={tier.icon ?? null}
        onChange={handleIconChange}
        label="Icon"
        disabled={uploading || saving}
      />
      <div className="flex items-center gap-2">
        <Button
          text={saving ? "Saving..." : "Save"}
          size="sm"
          onClick={handleSave}
          disabled={saving}
        />
        <Button
          variant="outline"
          text="Delete Tier"
          size="sm"
          onClick={handleDelete}
          disabled={saving}
        />
      </div>
    </ItemCard>
  );
};

const BadgesCrud = () => {
  const [categories, setCategories] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState(emptyCategory);
  const [newTier, setNewTier] = useState(emptyTier);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, tiersRes] = await Promise.all([
        fetchJson("/api/admin/task-categories"),
        fetchJson("/api/admin/category-tiers"),
      ]);
      setCategories(cats.categories ?? []);
      setTiers(tiersRes.tiers ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!categories.length) return;
    const exploration = categories.find(
      (cat) => String(cat.label || "").toLowerCase() === "exploration",
    );
    const nextId = String(exploration?.id ?? categories[0]?.id ?? "");
    if (!nextId) return;
    setSelectedCategoryId((prev) => prev || nextId);
    setNewTier((prev) => ({
      ...prev,
      category_id: prev.category_id || nextId,
    }));
  }, [categories]);

  const filteredTiers = useMemo(() => {
    const id = Number(selectedCategoryId);
    if (!id) return [];
    return tiers.filter((t) => t.category_id === id);
  }, [tiers, selectedCategoryId]);

  const handleTabClick = useCallback((event) => {
    const tab = event.currentTarget.dataset.tab;
    if (tab) setActiveTab(tab);
  }, []);

  const handleNewCategoryInputChange = useCallback((event) => {
    const { name, value } = event.target;
    if (!name) return;
    setNewCategory((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNewTierInputChange = useCallback((event) => {
    const { name, value } = event.target;
    if (!name) return;
    setNewTier((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNewTierCategoryChange = useCallback((event) => {
    const { value } = event.target;
    setNewTier((prev) => ({ ...prev, category_id: value }));
  }, []);

  const handleSelectedCategoryChange = useCallback((id) => {
    setSelectedCategoryId(String(id));
    setNewTier((prev) => ({ ...prev, category_id: String(id) }));
  }, []);

  const handleCategoryListInputChange = useCallback((event) => {
    const parsed = parseFieldName(event.target.name);
    if (!parsed || parsed.group !== "cat") return;
    const { id, field } = parsed;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, [field]: event.target.value } : cat,
      ),
    );
  }, []);

  const handleTierListInputChange = useCallback((event) => {
    const parsed = parseFieldName(event.target.name);
    if (!parsed || parsed.group !== "tier") return;
    const { id, field } = parsed;
    setTiers((prev) =>
      prev.map((tier) =>
        tier.id === id ? { ...tier, [field]: event.target.value } : tier,
      ),
    );
  }, []);

  const handleNewCategoryIconChange = useCallback((file) => {
    setNewCategory((prev) => ({ ...prev, _iconFile: file }));
  }, []);

  const handleNewTierIconChange = useCallback((file) => {
    setNewTier((prev) => ({ ...prev, _iconFile: file }));
  }, []);

  const handleCategoryChange = (id, key, value) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)),
    );
  };

  const handleTierChange = (id, key, value) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)),
    );
  };

  const uploadIcon = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const data = await fetchJson("/api/admin/badges-gallery/upload", {
      method: "POST",
      body: formData,
    });
    return data.url;
  };

  const handleUploadCategoryIcon = async (id, file) => {
    if (!file) return;
    setUploadingId(`cat-${id}`);
    try {
      const url = await uploadIcon(file);
      handleCategoryChange(id, "icon", url);
      await fetchJson(`/api/admin/task-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icon: url }),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleUploadTierIcon = async (id, file) => {
    if (!file) return;
    setUploadingId(`tier-${id}`);
    try {
      const url = await uploadIcon(file);
      handleTierChange(id, "icon", url);
      await fetchJson(`/api/admin/category-tiers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icon: url }),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const createCategory = async (event) => {
    event.preventDefault();
    setSavingId("new-category");
    setError(null);
    try {
      let iconUrl = null;
      if (newCategory._iconFile)
        iconUrl = await uploadIcon(newCategory._iconFile);
      const payload = {
        label: String(newCategory.label || "").trim(),
        description: newCategory.description || null,
        icon: iconUrl,
      };
      if (!payload.label) throw new Error("Category label is required");
      const data = await fetchJson("/api/admin/task-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setCategories((prev) => [...prev, data.category]);
      setNewCategory(emptyCategory);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const updateCategory = async (id) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setSavingId(`cat-${id}`);
    setError(null);
    try {
      const payload = {
        label: String(cat.label || "").trim(),
        description: cat.description || null,
        icon: cat.icon || null,
      };
      const data = await fetchJson(`/api/admin/task-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? data.category : c)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const deleteCategory = async (id) => {
    setSavingId(`cat-${id}`);
    setError(null);
    try {
      await fetchJson(`/api/admin/task-categories/${id}`, {
        method: "DELETE",
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setTiers((prev) => prev.filter((t) => t.category_id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const createTier = async (event) => {
    event.preventDefault();
    setSavingId("new-tier");
    setError(null);
    try {
      let iconUrl = null;
      if (newTier._iconFile) iconUrl = await uploadIcon(newTier._iconFile);
      const payload = {
        category_id: Number(newTier.category_id || selectedCategoryId),
        level: Number(newTier.level),
        title: String(newTier.title || "").trim(),
        required_count: Number(newTier.required_count),
        icon: iconUrl,
      };
      if (!payload.category_id || !payload.level || !payload.title) {
        throw new Error("Category, level, and title are required");
      }
      const data = await fetchJson("/api/admin/category-tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setTiers((prev) => [...prev, data.tier]);
      setNewTier((prev) => ({ ...emptyTier, category_id: prev.category_id }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const updateTier = async (id) => {
    const tier = tiers.find((t) => t.id === id);
    if (!tier) return;
    setSavingId(`tier-${id}`);
    setError(null);
    try {
      const payload = {
        category_id: Number(tier.category_id),
        level: Number(tier.level),
        title: String(tier.title || "").trim(),
        required_count: Number(tier.required_count),
        icon: tier.icon || null,
      };
      const data = await fetchJson(`/api/admin/category-tiers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setTiers((prev) => prev.map((t) => (t.id === id ? data.tier : t)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const deleteTier = async (id) => {
    setSavingId(`tier-${id}`);
    setError(null);
    try {
      await fetchJson(`/api/admin/category-tiers/${id}`, {
        method: "DELETE",
      });
      setTiers((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 page-wrapper ">
      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionHeadline
          title="Badges CRUD"
          subtitle="Manage task categories and achievement tiers."
        />
        <Button
          text={loading ? "Loading..." : "Refresh"}
          onClick={loadData}
          disabled={loading}
          size="sm"
          variant="outline"
        />
      </div>

      {error && (
        <div className="text-red-400 secondary text-sm border border-red-500/30 bg-red-500/10 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
      {/* tabs */}
      <div className="flex gap-1 border-b border-primary/20 ">
        {["categories", "tiers"].map((tab) => (
          <button
            key={tab}
            type="button"
            data-tab={tab}
            onClick={handleTabClick}
            className={`px-4 py-2 text-sm font-semibold capitalize duration-200 border-b-2 -mb-px cursor-pointer ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-chino/50 hover:text-chino"
            }`}
          >
            {tab === "categories" ? "Task Categories" : "Achievement Tiers"}
          </button>
        ))}
      </div>
      {/* content */}
      {activeTab === "categories" && (
        <div className="space-y-3">
          <SectionHeadline
            title="Add Task Category"
            subtitle="Create a new category for organizing tasks and awarding badges."
          />
          <ItemCard className="space-y-4">
            <form onSubmit={createCategory} className="space-y-4">
              <div className="grid gap-2 grid-cols-1">
                {CAT_FIELDS.map((field) => (
                  <Input
                    key={field.id}
                    data={{
                      ...field,
                      id: `new-cat-${field.id}`,
                      name: field.id,
                    }}
                    value={newCategory[field.id] ?? ""}
                    onChange={handleNewCategoryInputChange}
                    disabled={savingId === "new-category"}
                  />
                ))}
              </div>
              <UploadImageInput
                value={newCategory.icon}
                onChange={handleNewCategoryIconChange}
                label="Icon"
                disabled={savingId === "new-category"}
              />
              <Button
                size="sm"
                text={
                  savingId === "new-category" ? "Adding..." : "Add Category"
                }
                type="submit"
                disabled={savingId === "new-category"}
              />
            </form>
          </ItemCard>

          {loading ? (
            <p className="secondary text-sm text-chino/60">
              Loading categories...
            </p>
          ) : (
            <div className="grid gap-4 grid-cols-1">
              c
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  fields={CAT_FIELDS}
                  onFieldChange={handleCategoryListInputChange}
                  onIconUpload={handleUploadCategoryIcon}
                  onSave={updateCategory}
                  onDelete={deleteCategory}
                  saving={savingId === `cat-${cat.id}`}
                  uploading={uploadingId === `cat-${cat.id}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* achievement tiers tab */}

      {activeTab === "tiers" && (
        <div className="space-y-3">
          <SectionHeadline
            title="Add Achievement Tier"
            subtitle="Create new achievement tiers "
          />
          <ItemCard className="space-y-4">
            <form onSubmit={createTier} className="space-y-4">
              <div>
                <label htmlFor="new-tier-category">Category</label>
                <StyledSelect
                  id="new-tier-category"
                  value={newTier.category_id}
                  onChange={handleNewTierCategoryChange}
                  disabled={savingId === "new-tier"}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </StyledSelect>
              </div>
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
                    onChange={handleNewTierInputChange}
                    disabled={savingId === "new-tier"}
                  />
                ))}
              </div>
              <UploadImageInput
                value={newTier.icon}
                onChange={handleNewTierIconChange}
                label="Icon"
                disabled={savingId === "new-tier"}
              />
              <Button
                size="sm"
                text={savingId === "new-tier" ? "Adding..." : "Add Tier"}
                type="submit"
                disabled={savingId === "new-tier"}
              />
            </form>
          </ItemCard>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-chino/60 secondary">Category:</span>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectedCategoryChange(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors duration-150 cursor-pointer ${
                    String(selectedCategoryId) === String(cat.id)
                      ? "bg-primary/20 border-primary/60 text-primary"
                      : "border-primary/20 text-chino/60 hover:text-chino hover:border-primary/40"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="secondary text-sm text-chino/60">Loading tiers...</p>
          ) : (
            <div className="grid gap-4 grid-cols-1">
              {filteredTiers.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  fields={TIER_FIELDS}
                  onFieldChange={handleTierListInputChange}
                  onIconUpload={handleUploadTierIcon}
                  onSave={updateTier}
                  onDelete={deleteTier}
                  saving={savingId === `tier-${tier.id}`}
                  uploading={uploadingId === `tier-${tier.id}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BadgesCrud;
