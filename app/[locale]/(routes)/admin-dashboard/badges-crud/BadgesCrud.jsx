"use client";
import { useState, useCallback } from "react";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import Button from "@/app/[locale]/components/buttons/Button";
import ToggleButton from "@/app/[locale]/components/buttons/ToggleButton";
import TaskCategoriesList from "./TaskCategoriesList";
import AchievementTiersList from "./AchievementTiersList";
import {
  useAdminCategories,
  useAdminTiers,
} from "@/app/[locale]/lib/hooks/useAdminBadges";

const TAB_OPTIONS = [
  { label: "Task Categories", value: "categories" },
  { label: "Achievement Tiers", value: "tiers" },
];

const fetchJson = async (url, options) => {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

const uploadIcon = async (file, oldUrl = null) => {
  // Delete the existing image first (fire-and-forget on failure)
  if (oldUrl) {
    try {
      await fetch("/api/admin/badges-gallery/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: oldUrl }),
      });
    } catch {
      // Non-fatal — upload still proceeds
    }
  }
  const formData = new FormData();
  formData.append("file", file);
  const data = await fetchJson("/api/admin/badges-gallery/upload", {
    method: "POST",
    body: formData,
  });
  return data.url;
};

const BadgesCrud = ({ initialCategories, initialTiers }) => {
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");

  // SWR hooks — seeded with SSR data, no loading flash on first render
  const {
    categories,
    mutate: mutateCategories,
    isLoading: catsLoading,
  } = useAdminCategories(initialCategories);
  const {
    tiers,
    mutate: mutateTiers,
    isLoading: tiersLoading,
  } = useAdminTiers(initialTiers);

  const handleRefresh = useCallback(() => {
    mutateCategories();
    mutateTiers();
  }, [mutateCategories, mutateTiers]);

  /* ── Category handlers ── */

  const createCategory = useCallback(
    async (formData) => {
      setSavingId("new-category");
      setError(null);
      try {
        let iconUrl = null;
        if (formData._iconFile) iconUrl = await uploadIcon(formData._iconFile);
        const payload = {
          label: String(formData.label || "").trim(),
          description: formData.description || null,
          icon: iconUrl,
        };
        if (!payload.label) throw new Error("Category label is required");
        const data = await fetchJson("/api/admin/task-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // Instant cache update — no refetch required
        mutateCategories(
          (cur) => ({
            categories: [...(cur?.categories ?? []), data.category],
          }),
          { revalidate: false },
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setSavingId(null);
      }
    },
    [mutateCategories],
  );

  const updateCategory = useCallback(
    async (id, patch) => {
      setSavingId(`cat-${id}`);
      setError(null);
      try {
        let iconUrl = patch.icon || null;
        if (patch._iconFile)
          iconUrl = await uploadIcon(patch._iconFile, patch.icon || null);
        const payload = {
          label: String(patch.label || "").trim(),
          description: patch.description || null,
          icon: iconUrl,
        };
        const data = await fetchJson(`/api/admin/task-categories/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        mutateCategories(
          (cur) => ({
            categories: (cur?.categories ?? []).map((c) =>
              c.id === id ? data.category : c,
            ),
          }),
          { revalidate: false },
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setSavingId(null);
      }
    },
    [mutateCategories],
  );

  const deleteCategory = useCallback(
    async (id) => {
      setSavingId(`cat-${id}`);
      setError(null);
      try {
        await fetchJson(`/api/admin/task-categories/${id}`, {
          method: "DELETE",
        });
        mutateCategories(
          (cur) => ({
            categories: (cur?.categories ?? []).filter((c) => c.id !== id),
          }),
          { revalidate: false },
        );
        // Also purge tiers that belonged to this category from SWR cache
        mutateTiers(
          (cur) => ({
            tiers: (cur?.tiers ?? []).filter((t) => t.category_id !== id),
          }),
          { revalidate: false },
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setSavingId(null);
      }
    },
    [mutateCategories, mutateTiers],
  );

  /* ── Tier handlers ── */

  const createTier = useCallback(
    async (formData) => {
      setSavingId("new-tier");
      setError(null);
      try {
        let iconUrl = null;
        if (formData._iconFile) iconUrl = await uploadIcon(formData._iconFile);
        const payload = {
          category_id: Number(formData.category_id),
          level: Number(formData.level),
          title: String(formData.title || "").trim(),
          required_count: Number(formData.required_count),
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
        mutateTiers((cur) => ({ tiers: [...(cur?.tiers ?? []), data.tier] }), {
          revalidate: false,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setSavingId(null);
      }
    },
    [mutateTiers],
  );

  const updateTier = useCallback(
    async (id, patch) => {
      setSavingId(`tier-${id}`);
      setError(null);
      try {
        let iconUrl = patch.icon || null;
        if (patch._iconFile)
          iconUrl = await uploadIcon(patch._iconFile, patch.icon || null);
        const payload = {
          category_id: Number(patch.category_id),
          level: Number(patch.level),
          title: String(patch.title || "").trim(),
          required_count: Number(patch.required_count),
          icon: iconUrl,
        };
        const data = await fetchJson(`/api/admin/category-tiers/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        mutateTiers(
          (cur) => ({
            tiers: (cur?.tiers ?? []).map((t) => (t.id === id ? data.tier : t)),
          }),
          { revalidate: false },
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setSavingId(null);
      }
    },
    [mutateTiers],
  );

  const deleteTier = useCallback(
    async (id) => {
      setSavingId(`tier-${id}`);
      setError(null);
      try {
        await fetchJson(`/api/admin/category-tiers/${id}`, {
          method: "DELETE",
        });
        mutateTiers(
          (cur) => ({
            tiers: (cur?.tiers ?? []).filter((t) => t.id !== id),
          }),
          { revalidate: false },
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setSavingId(null);
      }
    },
    [mutateTiers],
  );

  return (
    <div className="space-y-6 page-wrapper">
      {error && (
        <div className="text-red-400 secondary text-sm border border-red-500/30 bg-red-500/10 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      {/* Tab switcher */}
      <ToggleButton
        variant="layout"
        options={TAB_OPTIONS}
        value={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab content */}
      {activeTab === "categories" && (
        <TaskCategoriesList
          categories={categories}
          loading={catsLoading}
          savingId={savingId}
          onCreate={createCategory}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
        />
      )}

      {activeTab === "tiers" && (
        <AchievementTiersList
          categories={categories}
          tiers={tiers}
          loading={tiersLoading}
          savingId={savingId}
          onCreate={createTier}
          onUpdate={updateTier}
          onDelete={deleteTier}
        />
      )}
    </div>
  );
};

export default BadgesCrud;
