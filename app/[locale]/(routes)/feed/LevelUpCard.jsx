import React from "react";
import { IoFlashOutline } from "react-icons/io5";
import { timeAgo } from "../../lib/utils/utils";
import ItemCard from "../../components/container/ItemCard";
import AvatarTag from "@/app/[locale]/components/elements/AvatarTag";
import FormatedTime from "../../components/elements/FormatedTime";

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
    <ItemCard>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex gap-1">
            <AvatarTag user={user} size="md" />
            <div className="flex flex-col justify-end">
              <FormatedTime time={timeAgo(occurred_at)} />
              <p className="text-sm secondary text-cream font-light">
                <b className="font-bold">{user?.display_name}</b> has reached
                level {level} and acquired the{" "}
                <span className={`font-bold ${textClass}`}>{badgeLabel}</span>{" "}
                badge!
              </p>
            </div>
          </div>
        </div>
        <div
          className={`h-12 w-12 rounded-md border flex items-center justify-center shrink-0 ${colors.ring}`}
        >
          <IoFlashOutline size={20} />
        </div>
      </div>
    </ItemCard>
  );
};

export default LevelUpCard;
