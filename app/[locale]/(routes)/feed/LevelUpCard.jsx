import React from "react";
import Image from "next/image";
import { IoFlashOutline } from "react-icons/io5";
import BorderSvg from "@/app/[locale]/components/elements/BorderSvg";

const TIER_COLORS = {
  bronze: {
    ring: "border-orange-500/60  bg-orange-500/20  text-orange-300",
    glow: "bg-orange-500",
  },
  silver: {
    ring: "border-slate-400/60   bg-slate-500/20   text-slate-300",
    glow: "bg-slate-400",
  },
  gold: {
    ring: "border-yellow-400/60  bg-yellow-500/20  text-yellow-300",
    glow: "bg-yellow-400",
  },
  platinum: {
    ring: "border-cyan-400/60   bg-cyan-500/20    text-cyan-300",
    glow: "bg-cyan-500",
  },
  diamond: {
    ring: "border-violet-400/60  bg-violet-500/20  text-violet-300",
    glow: "bg-violet-500",
  },
  legend: {
    ring: "border-teal-400/60   bg-teal-500/20    text-teal-300",
    glow: "bg-teal-500",
  },
};

const BADGE_BY_LEVEL = {
  5: "bronze",
  10: "silver",
  15: "gold",
  20: "platinum",
  25: "diamond",
  30: "legend",
};

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const LevelUpCard = ({ item }) => {
  const { payload, user, occurred_at } = item;
  const level = payload?.current_level ?? payload?.new_level ?? null;
  const badgeKey = String(
    payload?.badge ?? (level != null ? BADGE_BY_LEVEL[level] : "") ?? "",
  ).toLowerCase();

  const colors = TIER_COLORS[badgeKey] ?? TIER_COLORS.bronze;
  const textClass = colors.ring
    .trim()
    .split(/\s+/)
    .find((c) => c.startsWith("text-"));
  const badgeLabel = badgeKey
    ? `${badgeKey.charAt(0).toUpperCase()}${badgeKey.slice(1)}`
    : "Badge";

  return (
    <div className="rounded-lg p-3 bg-teal-400/10 backdrop-blur-lg relative overflow-hidden">
      <BorderSvg strokeWidth={0.6} />
      <div
        className={`absolute left-0 top-0 w-[40%] h-[30%] rounded-full blur-[70px] -z-1 opacity-20 ${colors.glow}`}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {user?.image_url ? (
          <Image
            src={user.image_url}
            alt={user.display_name ?? "user"}
            width={32}
            height={32}
            className="rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-teal-300 uppercase">
              {(user?.display_name ?? "?")[0]}
            </span>
          </div>
        )}
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-cream secondary">
            {user?.display_name ?? "Someone"}
          </span>
          <span className="text-[10px] text-chino/60 secondary">
            {formatTime(occurred_at)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex items-center gap-3">
        <div
          className={`h-12 w-12 rounded-full border flex items-center justify-center shrink-0 ${colors.ring}`}
        >
          <IoFlashOutline size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-cream leading-tight">
            {user?.display_name ?? "Someone"} has reached level {level} and
            acquired the{" "}
            <span className={`font-bold ${textClass}`}>{badgeLabel}</span>{" "}
            badge!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LevelUpCard;
