/**
 * ProfileSections — pure render components shared between the client
 * MyProfile shell and the async server ProfileAnalytics component.
 *
 * No hooks, no "use client" — safe to import from server components.
 */

import ItemCard from "@/app/[locale]/components/container/ItemCard";
import { getEarnedTiers } from "@/app/[locale]/lib/local-bd/levelProgressData";

// ─── Badges ───────────────────────────────────────────────────────────────────

const BADGE_LIMIT = 6;

export const BadgesSection = ({ badgeProgress = [], xp = {} }) => {
  const categoryBadges = badgeProgress
    .filter((p) => p.current_level > 0)
    .flatMap((p) => {
      return (p.earned_tiers ?? []).map((t) => ({
        id: `cat-${p.category_id}-${t.level}`,
        displayLevel: t.level,
        title: t.title,
        subtitle: p.category_label ?? "",
        sortKey: new Date(p.created_at ?? 0).getTime() + t.level,
      }));
    });

  const levelBadges = getEarnedTiers(xp?.current_level ?? 1).map((t) => ({
    id: `lvl-${t.threshold}`,
    displayLevel: t.threshold,
    title: t.name,
    subtitle: "Level Badge",
    sortKey: t.threshold,
  }));

  const sorted = [
    ...categoryBadges.sort((a, b) => b.sortKey - a.sortKey),
    ...levelBadges.sort((a, b) => b.sortKey - a.sortKey),
  ].slice(0, BADGE_LIMIT);

  if (sorted.length === 0) return null;

  return (
    <ItemCard className="space-y-3">
      <h2 className="text-cream mb-3 font-bold text-2xl">Badges</h2>
      <div className="gap-2 flex flex-wrap">
        {sorted.map((badge) => (
          <div
            key={badge.id}
            className="flex flex-col items-center gap-2 rounded-xl border border-primary/15 bg-primary/10 p-4 text-center"
          >
            <div className="h-12 w-12 rounded-full border bg-primary flex items-center justify-center shrink-0">
              <span className="text-black font-bold text-lg leading-none">
                {badge.displayLevel}
              </span>
            </div>
            <div>
              <p className="text-cream text-xs font-bold leading-tight">
                {badge.title}
              </p>
              <p className="text-chino/60 text-[10px] secondary mt-0.5">
                {badge.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ItemCard>
  );
};

// ─── Stats ────────────────────────────────────────────────────────────────────

const SEGMENTS_COUNT = 5;

const GameBar = ({ label, count, total, color }) => {
  const filled =
    total > 0
      ? Math.max(
          Math.round((count / total) * SEGMENTS_COUNT),
          count > 0 ? 1 : 0,
        )
      : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] tracking-[1px] text-chino">{label}</span>
        <span className="text-[10px] text-primary/80">{count}</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: SEGMENTS_COUNT }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-sm transition-all ${
              i < filled ? color : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const Stats = ({ objectiveStats }) => {
  const { byStatus = {}, byPriority = {}, total = 0 } = objectiveStats ?? {};

  return (
    <ItemCard className="grid grid-cols-2 gap-x-6 gap-y-2">
      <div className="space-y-4">
        <p className="text-[9px] uppercase tracking-[0.2em] text-primary/70 font-semibold">
          Objectives
        </p>
        <GameBar
          label="Todo"
          count={byStatus.todo ?? 0}
          total={total}
          color="bg-sky-400"
        />
        <GameBar
          label="In Progress"
          count={byStatus.in_progress ?? 0}
          total={total}
          color="bg-teal-400"
        />
        <GameBar
          label="Completed"
          count={byStatus.completed ?? 0}
          total={total}
          color="bg-green-500"
        />
      </div>
      <div className="space-y-4">
        <p className="text-[9px] uppercase tracking-[0.2em] text-primary/70 font-semibold">
          Difficulty
        </p>
        <GameBar
          label="Low"
          count={byPriority.low ?? 0}
          total={total}
          color="bg-blue-400"
        />
        <GameBar
          label="Medium"
          count={byPriority.medium ?? 0}
          total={total}
          color="bg-violet-400"
        />
        <GameBar
          label="High"
          count={byPriority.high ?? 0}
          total={total}
          color="bg-red-400"
        />
      </div>
    </ItemCard>
  );
};
