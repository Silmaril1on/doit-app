"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import { MdClose } from "react-icons/md";
import ReactCountryFlag from "react-country-flag";
import { getCountryCode } from "@/app/[locale]/components/elements/CountryFlags";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";

const ALL_TABS = [
  { key: "objectives", label: "Objectives" },
  { key: "achievements", label: "Achievements" },
];

// priority order and colors (matches DonutChart palette style)
const PRIORITY_ORDER = ["high", "medium", "low"];
const PRIORITY_META = {
  high: { color: "#9b59ff", label: "high" },
  medium: { color: "#ff3d81", label: "medium" },
  low: { color: "#4affd7", label: "low" },
};

// ─── Animated bar row ────────────────────────────────────────────────────────

const BarRow = ({ country, value, max, index, priorityBreakdown = {} }) => {
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
      // className="space-y-1.5"
    >
      {/* bar row */}
      <div className="flex items-center gap-3">
        <span className="secondary capitalize text-xs text-chino/70 w-28 shrink-0 truncate flex items-center gap-1.5">
          {getCountryCode(country) && (
            <ReactCountryFlag
              countryCode={getCountryCode(country)}
              svg
              style={{ width: "1em", height: "1em" }}
            />
          )}
          {country}
        </span>
        <div className="flex-1 h-2 bg-teal-500/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full flex overflow-hidden rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{
              delay: index * 0.07 + 0.1,
              duration: 0.5,
              ease: "easeOut",
            }}
          >
            {PRIORITY_ORDER.map((key) => {
              const count = priorityBreakdown[key] ?? 0;
              if (count === 0) return null;
              const segPct = value > 0 ? (count / value) * 100 : 0;
              return (
                <div
                  key={key}
                  style={{
                    width: `${segPct}%`,
                    background: PRIORITY_META[key].color,
                  }}
                  className="h-full shrink-0"
                />
              );
            })}
          </motion.div>
        </div>
        <span className="secondary text-xs font-bold text-cream w-6 text-right shrink-0">
          {value}
        </span>
      </div>

      {/* priority counts */}
      <div className="flex gap-3 pl-[calc(7rem+0.75rem)] pr-[calc(1.5rem+0.75rem)]">
        {PRIORITY_ORDER.map((key) => {
          const count = priorityBreakdown[key] ?? 0;
          if (count === 0) return null;
          return (
            <span
              key={key}
              className="secondary text-[10px] text-chino capitalize"
            >
              {count} {PRIORITY_META[key].label}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── Modal ───────────────────────────────────────────────────────────────────

const AllCountriesModal = ({ activeTab, userId, onClose }) => {
  const [allStats, setAllStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetch(`/api/statistics/country-stats`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setAllStats(data.stats ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const max = Math.max(
    ...allStats
      .filter((s) => (s[activeTab] ?? 0) > 0)
      .map((s) => s[activeTab] ?? 0),
    1,
  );
  const visibleStats = allStats.filter((s) => (s[activeTab] ?? 0) > 0);

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onPointerDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-black border border-teal-500/20 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-teal-500/10">
          <p className="text-cream font-semibold">
            All Countries —{" "}
            {activeTab === "objectives" ? "Objectives" : "Achievements"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-chino/60 hover:text-cream duration-200 cursor-pointer"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {loading && (
            <p className="secondary text-xs text-chino/50 text-center py-6">
              Loading…
            </p>
          )}
          {!loading && visibleStats.length === 0 && (
            <p className="secondary text-xs text-chino/50 text-center py-6">
              No data found.
            </p>
          )}
          {!loading &&
            visibleStats.map((s, i) => (
              <BarRow
                key={s.country}
                country={s.country}
                value={s[activeTab] ?? 0}
                max={max}
                index={i}
                priorityBreakdown={s[`${activeTab}_priority`] ?? {}}
              />
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

const CountryTasks = ({ topStats = [], hasMore = false, userId }) => {
  const [activeTab, setActiveTab] = useState("objectives");
  const [modalOpen, setModalOpen] = useState(false);

  const visibleStats = topStats.filter((s) => (s[activeTab] ?? 0) > 0);
  const max = Math.max(...visibleStats.map((s) => s[activeTab] ?? 0), 1);

  return (
    <>
      <ItemCard className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <SectionHeadline
            title="Country Tasks"
            subtitle="Task breakdown by country"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5">
          {ALL_TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "fill" : "outline"}
              size="sm"
              text={tab.label}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>

        {/* Bar list */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {visibleStats.length === 0 && (
                <p className="secondary text-xs text-chino/50 text-center py-6">
                  You don&apos;t have any{" "}
                  {activeTab === "objectives" ? "objectives" : "achievements"}{" "}
                  yet.
                </p>
              )}
              {visibleStats.map((s, i) => (
                <BarRow
                  key={`${activeTab}-${s.country}`}
                  country={s.country}
                  value={s[activeTab] ?? 0}
                  max={max}
                  index={i}
                  priorityBreakdown={s[`${activeTab}_priority`] ?? {}}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* View All */}
        {hasMore && (
          <div className="pt-1">
            <Button
              text="View All Country Tasks"
              variant="outline"
              onClick={() => setModalOpen(true)}
              className="w-full text-xs"
            />
          </div>
        )}
      </ItemCard>

      <AnimatePresence>
        {modalOpen && (
          <AllCountriesModal
            activeTab={activeTab}
            userId={userId}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CountryTasks;
