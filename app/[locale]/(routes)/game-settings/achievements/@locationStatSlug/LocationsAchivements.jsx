"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import { CONTINENT_BADGES } from "@/app/[locale]/lib/utils/countryUtils";

const DUMMY_STATS = {
  countries: {
    visited: 34,
    total: 195,
    list: [
      "Georgia",
      "France",
      "Germany",
      "Italy",
      "Spain",
      "Portugal",
      "Greece",
      "Turkey",
      "Japan",
      "South Korea",
      "China",
      "India",
      "Thailand",
      "Vietnam",
      "Indonesia",
      "Brazil",
      "Argentina",
      "Colombia",
      "Mexico",
      "Canada",
      "United States",
      "Australia",
      "New Zealand",
      "South Africa",
      "Egypt",
      "Morocco",
      "Kenya",
      "Nigeria",
      "Ghana",
      "Ethiopia",
      "Tanzania",
      "Uganda",
      "Senegal",
      "Algeria",
    ],
  },
  cities: { visited: 248, total: 1000, list: [] },
  continents: {
    visited: 3,
    total: 7,
    progress: [
      {
        continent: "Africa",
        total: 54,
        visitedCount: 10,
        threshold: 27,
        remaining: 17,
        unlocked: false,
      },
      {
        continent: "Antarctica",
        total: 1,
        visitedCount: 0,
        threshold: 1,
        remaining: 1,
        unlocked: false,
      },
      {
        continent: "Asia",
        total: 50,
        visitedCount: 8,
        threshold: 25,
        remaining: 17,
        unlocked: false,
      },
      {
        continent: "Europe",
        total: 46,
        visitedCount: 9,
        threshold: 23,
        remaining: 14,
        unlocked: false,
      },
      {
        continent: "North America",
        total: 23,
        visitedCount: 3,
        threshold: 12,
        remaining: 9,
        unlocked: false,
      },
      {
        continent: "Oceania",
        total: 14,
        visitedCount: 2,
        threshold: 7,
        remaining: 5,
        unlocked: false,
      },
      {
        continent: "South America",
        total: 12,
        visitedCount: 2,
        threshold: 6,
        remaining: 4,
        unlocked: false,
      },
    ],
  },
};
// ─────────────────────────────────────────────────────────────────────────────

// ── Image-reveal progress bar ─────────────────────────────────────────────────
const ImageProgressBar = ({ src, alt, visited, total, label, delay = 0 }) => {
  const pct =
    total === 0 ? 0 : Math.min(Math.round((visited / total) * 100), 100);
  const [animated, setAnimated] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          const id = setTimeout(() => setAnimated(pct), delay);
          return () => clearTimeout(id);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pct, delay]);

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="secondary text-xs uppercase tracking-[0.14em] text-primary/80">
          {label}
        </span>
        <span className="secondary text-xs font-semibold text-cream/70">
          {visited} / {total}
          <span className="text-primary ml-1.5">{pct}%</span>
        </span>
      </div>

      <div className="relative h-28 w-full overflow-hidden rounded-lg border border-primary/20">
        {/* Grayscale base */}
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 600px"
          className="object-cover grayscale brightness-50"
          priority={false}
        />

        {/* Colour reveal via clip-path */}
        <div
          className="absolute inset-0 overflow-hidden transition-[clip-path] duration-1400 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ clipPath: `inset(0 ${100 - animated}% 0 0)` }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, 600px"
            className="object-cover brightness-90"
            priority={false}
          />
        </div>

        {/* Glowing frontier edge */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary/80 shadow-[0_0_8px_2px_rgba(252,185,19,0.6)] transition-[left] duration-1400 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: `${animated}%` }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

        {/* Centred % */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-cream/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Single continent progress pill ───────────────────────────────────────────
const ContinentPill = ({ item }) => {
  const [open, setOpen] = useState(false);
  const badge = CONTINENT_BADGES[item.continent];
  const pct =
    item.total === 0
      ? 0
      : Math.round((item.visitedCount / item.threshold) * 100);
  const displayPct = Math.min(pct, 100);

  return (
    <div className="rounded-xl border border-primary/15 bg-black/30 overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Icon / Badge */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg border ${
            item.unlocked
              ? "border-primary/60 bg-primary/15"
              : "border-white/10 bg-white/5"
          }`}
        >
          {badge?.image_url ? (
            <Image
              src={badge.image_url}
              alt={item.continent}
              width={28}
              height={28}
              className="rounded-full object-cover"
            />
          ) : (
            <span>{badge?.icon ?? "🌍"}</span>
          )}
        </div>

        {/* Name + fraction */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`secondary text-xs uppercase tracking-[0.14em] font-semibold ${
                item.unlocked ? "text-primary" : "text-cream/60"
              }`}
            >
              {item.continent}
            </span>
            <span className="secondary text-[10px] text-cream/40 shrink-0">
              {item.visitedCount} / {item.threshold} countries
            </span>
          </div>

          {/* Mini bar */}
          <div className="mt-1.5 h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                width: `${displayPct}%`,
                background: item.unlocked
                  ? "linear-gradient(90deg, #fcb913, #ffdd57)"
                  : "rgba(255,255,255,0.25)",
              }}
            />
          </div>
        </div>

        {/* Unlock badge or chevron */}
        <div className="flex-shrink-0 ml-1">
          {item.unlocked ? (
            <svg
              className="h-4 w-4 text-primary"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8l3.5 3.5L13 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              className={`h-3.5 w-3.5 text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Expandable hint */}
      <AnimatePresence initial={false}>
        {(open || item.unlocked) && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {item.unlocked ? (
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/8 p-3">
                  {/* Badge icon large */}
                  <div className="flex-shrink-0 w-11 h-11 rounded-full border border-primary/40 bg-primary/15 flex items-center justify-center text-2xl">
                    {badge?.image_url ? (
                      <Image
                        src={badge.image_url}
                        alt={item.continent}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span>{badge?.icon ?? "🌍"}</span>
                    )}
                  </div>
                  <div>
                    <p className="secondary text-[10px] uppercase tracking-widest text-primary mb-0.5">
                      {badge?.title ?? item.continent} Unlocked
                    </p>
                    <p className="primary text-xs text-cream/70">
                      {badge?.description ??
                        `You've unlocked the ${item.continent} badge!`}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="secondary text-[10px] text-cream/40 leading-relaxed">
                  You have{" "}
                  <span className="text-primary font-semibold">
                    {item.remaining}
                  </span>{" "}
                  {item.remaining === 1 ? "country" : "countries"} left to visit
                  in order to unlock the{" "}
                  <span className="text-cream/70 font-semibold">
                    {badge?.title ?? item.continent}
                  </span>{" "}
                  badge.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

const LocationsAchivements = ({ stats }) => {
  // ── Swap DUMMY_STATS ↔ stats here ─────────────────────────────────────────
  // To use real server data: comment out the DUMMY_STATS line below.
  const s = DUMMY_STATS ?? stats;
  // const s = stats ?? EMPTY_STATS;
  // ─────────────────────────────────────────────────────────────────────────

  const subtitle = `${s.countries.visited} ${s.countries.visited === 1 ? "country" : "countries"} · ${s.cities.visited} ${s.cities.visited === 1 ? "city" : "cities"} · ${s.continents.visited} continents unlocked`;

  return (
    <div className="space-y-2">
      <SectionHeadline title="World Explorer" subtitle={subtitle} />
      <ItemCard className="space-y-7">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-7"
        >
          {/* Countries bar */}
          <motion.div variants={itemVariants}>
            <ImageProgressBar
              src="/countries.webp"
              alt="Countries map"
              visited={s.countries.visited}
              total={s.countries.total}
              label="Countries visited"
              delay={0}
            />
          </motion.div>

          {/* Cities bar */}
          <motion.div variants={itemVariants}>
            <ImageProgressBar
              src="/cities.webp"
              alt="Cities skyline"
              visited={s.cities.visited}
              total={s.cities.total}
              label="Cities visited"
              delay={150}
            />
          </motion.div>

          {/* Continents bar */}
          <motion.div variants={itemVariants}>
            <ImageProgressBar
              src="/continents.jpg"
              alt="Continents"
              visited={s.continents.visited}
              total={s.continents.total}
              label="Continents unlocked"
              delay={300}
            />
          </motion.div>

          {/* Continent badge pills */}
          <motion.div variants={itemVariants} className="space-y-2">
            <p className="secondary text-[10px] uppercase tracking-[0.16em] text-cream/40 mb-3">
              Continent Quests
            </p>
            <div className="space-y-2">
              {s.continents.progress.map((item) => (
                <ContinentPill key={item.continent} item={item} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </ItemCard>
    </div>
  );
};

export default LocationsAchivements;
