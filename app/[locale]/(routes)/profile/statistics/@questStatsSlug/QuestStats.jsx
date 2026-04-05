"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import DonutChart from "@/app/[locale]/components/elements/DonutChart";
import ProgressBar from "@/app/[locale]/components/elements/ProgressBar";
import { TASK_CATEGORIES } from "@/app/[locale]/lib/local-bd/categoryTypesData";

// ─── Theme constants — mirrors existing DonutChart/CountryTasks palette ───────

const STATUS_COLORS = {
  todo: "#f59e0b",        // amber  — "pending, not started yet"
  in_progress: "#60a5fa", // sky-blue — "in motion, focused"
  completed: "#22c55e",   // green  — "done, success"
};

const PRIORITY_META = {
  high: { color: "#9b59ff", label: "High" },
  medium: { color: "#ff3d81", label: "Medium" },
  low: { color: "#4affd7", label: "Low" },
};

const CATEGORY_COLORS = {
  1: "#4affd7", // Exploration
  2: "#d99d00", // Culinary
  3: "#9b59ff", // Nightlife
  4: "#ff3d81", // Experiences
  5: "#fcb913", // Shopping
};

// ─── Filter definitions ───────────────────────────────────────────────────────

const PRIMARY_TABS = [
  { key: "all", label: "All" },
  { key: "todo", label: "TODO" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

const PRIORITY_TABS = [
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
];

// ─── CategoryBarRow ───────────────────────────────────────────────────────────

const CategoryBarRow = ({ label, value, max, index, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="flex items-center gap-3">
        <span className="secondary text-xs text-chino/70 w-24 shrink-0 truncate capitalize">
          {label}
        </span>
        <div className="flex-1 h-2 bg-teal-500/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{
              delay: index * 0.07 + 0.1,
              duration: 0.5,
              ease: "easeOut",
            }}
          />
        </div>
        <span className="secondary text-xs font-bold text-cream w-6 text-right shrink-0">
          {value}
        </span>
      </div>
    </motion.div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const QuestStats = ({ tasks = [] }) => {
  const [primaryFilter, setPrimaryFilter] = useState("all");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [priorityFilters, setPriorityFilters] = useState([]);

  const toggleCategory = (id) => {
    setCategoryFilters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const togglePriority = (key) => {
    setPriorityFilters((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  // ─── Derived: tasks matching all active filters ────────────────────────────

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (primaryFilter === "todo" && t.status !== "todo") return false;
      if (primaryFilter === "active" && t.status !== "in_progress") return false;
      if (primaryFilter === "completed" && t.status !== "completed") return false;
      // normalize to number — Supabase may return task_category as string
      if (
        categoryFilters.length > 0 &&
        !categoryFilters.includes(Number(t.task_category))
      )
        return false;
      const p = t.priority ?? "medium";
      if (priorityFilters.length > 0 && !priorityFilters.includes(p))
        return false;
      return true;
    });
  }, [tasks, primaryFilter, categoryFilters, priorityFilters]);

  // ─── Status counts for primary filter badge labels ─────────────────────────

  const statusCounts = useMemo(() => {
    const base = tasks.filter((t) => {
      if (
        categoryFilters.length > 0 &&
        !categoryFilters.includes(Number(t.task_category))
      )
        return false;
      const p = t.priority ?? "medium";
      if (priorityFilters.length > 0 && !priorityFilters.includes(p))
        return false;
      return true;
    });
    return {
      all: base.length,
      todo: base.filter((t) => t.status === "todo").length,
      active: base.filter((t) => t.status === "in_progress").length,
      completed: base.filter((t) => t.status === "completed").length,
    };
  }, [tasks, categoryFilters, priorityFilters]);

  // ─── Donut chart segments ──────────────────────────────────────────────────
  // "All" view → status distribution
  // Specific status view → priority breakdown of that status

  const donutSegments = useMemo(() => {
    if (primaryFilter === "all") {
      return [
        {
          key: "todo",
          label: "Todo",
          value: statusCounts.todo,
          color: STATUS_COLORS.todo,
        },
        {
          key: "active",
          label: "Active",
          value: statusCounts.active,
          color: STATUS_COLORS.in_progress,
        },
        {
          key: "completed",
          label: "Completed",
          value: statusCounts.completed,
          color: STATUS_COLORS.completed,
        },
      ];
    }

    return PRIORITY_TABS.map((p) => ({
      key: p.key,
      label: p.label,
      value: filteredTasks.filter((t) => (t.priority ?? "medium") === p.key)
        .length,
      color: PRIORITY_META[p.key].color,
    }));
  }, [primaryFilter, filteredTasks, statusCounts]);

  const donutCenterSub =
    primaryFilter === "all"
      ? "total"
      : PRIMARY_TABS.find((t) => t.key === primaryFilter)?.label?.toLowerCase() ?? "";

  // ─── Category breakdown ────────────────────────────────────────────────────

  const categoryData = useMemo(() => {
    return TASK_CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      count: filteredTasks.filter((t) => Number(t.task_category) === cat.id).length,
      color: CATEGORY_COLORS[cat.id] ?? "#4affd7",
    }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filteredTasks]);

  const categoryMax = useMemo(
    () => Math.max(...categoryData.map((c) => c.count), 1),
    [categoryData],
  );

  // ─── Priority breakdown (mini bars, "All" view only) ──────────────────────

  const priorityData = useMemo(
    () =>
      PRIORITY_TABS.map((p) => ({
        key: p.key,
        label: p.label,
        count: filteredTasks.filter(
          (t) => (t.priority ?? "medium") === p.key,
        ).length,
        color: PRIORITY_META[p.key].color,
      })).filter((p) => p.count > 0),
    [filteredTasks],
  );

  const priorityMax = useMemo(
    () => Math.max(...priorityData.map((p) => p.count), 1),
    [priorityData],
  );

  // ─── Progress — always counts all tasks, only secondary filters apply ──────

  const progressStats = useMemo(() => {
    const base = tasks.filter((t) => {
      if (
        categoryFilters.length > 0 &&
        !categoryFilters.includes(Number(t.task_category))
      )
        return false;
      const p = t.priority ?? "medium";
      if (priorityFilters.length > 0 && !priorityFilters.includes(p))
        return false;
      return true;
    });
    return {
      completed: base.filter((t) => t.status === "completed").length,
      total: base.length,
    };
  }, [tasks, categoryFilters, priorityFilters]);

  // ─── Stable key for AnimatePresence transitions ────────────────────────────

  const filterKey = `${primaryFilter}-${categoryFilters.join(",")}-${priorityFilters.join(",")}`;

  const isEmpty = tasks.length === 0;

  return (
    <ItemCard className="space-y-4">
      {/* Header */}
      <SectionHeadline
        title="Quest Stats"
        subtitle="Your task performance overview"
      />

      {/* Primary filter — segmented control */}
      <div className="flex gap-1.5 flex-wrap">
        {PRIMARY_TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={primaryFilter === tab.key ? "fill" : "outline"}
            size="sm"
            text={`${tab.label}${statusCounts[tab.key] != null ? ` · ${statusCounts[tab.key]}` : ""}`}
            onClick={() => setPrimaryFilter(tab.key)}
          />
        ))}
      </div>

      {/* Donut chart */}
      {isEmpty ? (
        <p className="secondary text-xs text-chino/50 text-center py-6">
          No tasks yet. Start adding quests!
        </p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filterKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center py-2"
          >
            <DonutChart
              segments={donutSegments}
              size={130}
              strokeWidth={18}
              showLegend
              centerLabel={filteredTasks.length}
              centerSubLabel={donutCenterSub}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Category filter */}
      <div className="space-y-1.5">
        <p className="secondary text-[10px] uppercase tracking-[0.14em] text-chino/60">
          Category
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {TASK_CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={categoryFilters.includes(cat.id) ? "fill" : "outline"}
              size="sm"
              text={cat.label}
              onClick={() => toggleCategory(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* Category breakdown bars */}
      {!isEmpty && (
        <div className="space-y-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`cats-${filterKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-2.5"
            >
              {categoryData.length === 0 ? (
                <p className="secondary text-xs text-chino/50 text-center py-4">
                  No tasks match the current filters.
                </p>
              ) : (
                categoryData.map((cat, i) => (
                  <CategoryBarRow
                    key={cat.id}
                    label={cat.label}
                    value={cat.count}
                    max={categoryMax}
                    index={i}
                    color={cat.color}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Priority filter + mini-bars */}
      {!isEmpty && (
        <div className="space-y-1.5">
          <p className="secondary text-[10px] uppercase tracking-[0.14em] text-chino/60">
            Priority
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {PRIORITY_TABS.map((p) => (
              <Button
                key={p.key}
                variant={priorityFilters.includes(p.key) ? "fill" : "outline"}
                size="sm"
                text={p.label}
                onClick={() => togglePriority(p.key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Priority mini-bars — only in "All" view */}
      {!isEmpty && primaryFilter === "all" && priorityData.length > 0 && (
        <div className="space-y-2">
          <div className="flex gap-3">
            {priorityData.map((p) => (
              <div key={p.key} className="flex-1 space-y-1">
                <div className="h-1.5 w-full bg-teal-500/10 rounded-full overflow-hidden">
                  <motion.div
                    key={`pri-${filterKey}-${p.key}`}
                    className="h-full rounded-full"
                    style={{ background: p.color }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.round((p.count / priorityMax) * 100)}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="secondary text-[10px] text-chino/70 capitalize">
                    {p.label}
                  </span>
                  <span className="secondary text-[10px] font-bold text-cream">
                    {p.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ItemCard>
  );
};

export default QuestStats;
