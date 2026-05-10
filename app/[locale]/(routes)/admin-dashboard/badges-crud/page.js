"use client";
import React, { useCallback, useEffect, useState } from "react";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import Button from "@/app/[locale]/components/buttons/Button";
import TaskCategoriesList from "./TaskCategoriesList";
import AchievementTiersList from "./AchievementTiersList";

const fetchJson = async (url, options) => {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

const BadgesCrud = () => {
  const [categories, setCategories] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
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

  const handleTabClick = useCallback((event) => {
    const tab = event.currentTarget.dataset.tab;
    if (tab) setActiveTab(tab);
  }, []);

  const uploadIcon = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const data = await fetchJson("/api/admin/badges-gallery/upload", {
      method: "POST",
      body: formData,
    });
    return data.url;
  };

  /* ── Category handlers ── */

  const createCategory = async (formData) => {
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
      setCategories((prev) => [...prev, data.category]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const updateCategory = async (id, patch) => {
    setSavingId(`cat-${id}`);
    setError(null);
    try {
      let iconUrl = patch.icon || null;
      if (patch._iconFile) iconUrl = await uploadIcon(patch._iconFile);
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
      await fetchJson(`/api/admin/task-categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setTiers((prev) => prev.filter((t) => t.category_id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  /* ── Tier handlers ── */

  const createTier = async (formData) => {
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
      setTiers((prev) => [...prev, data.tier]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const updateTier = async (id, patch) => {
    setSavingId(`tier-${id}`);
    setError(null);
    try {
      let iconUrl = patch.icon || null;
      if (patch._iconFile) iconUrl = await uploadIcon(patch._iconFile);
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
      await fetchJson(`/api/admin/category-tiers/${id}`, { method: "DELETE" });
      setTiers((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 page-wrapper">
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
      <div className="flex gap-1 border-b border-primary/20">
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
        <TaskCategoriesList
          categories={categories}
          loading={loading}
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
          loading={loading}
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
