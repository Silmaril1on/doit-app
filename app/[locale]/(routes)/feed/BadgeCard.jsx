import React from "react";
import Image from "next/image";
import { IoRibbonOutline } from "react-icons/io5";
import BorderSvg from "@/app/[locale]/components/elements/BorderSvg";

// Map badge level (1-6) to a readable colour scheme
const BADGE_LEVEL_COLORS = [
  "", // 0 — unused
  "border-slate-400/60  bg-slate-500/20  text-slate-300", // 1
  "border-green-400/60  bg-green-500/20  text-green-300", // 2
  "border-yellow-400/60 bg-yellow-500/20 text-yellow-300", // 3
  "border-orange-400/60 bg-orange-500/20 text-orange-300", // 4
  "border-violet-400/60 bg-violet-500/20 text-violet-300", // 5
  "border-teal-400/60   bg-teal-500/20   text-teal-300", // 6
];

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const BadgeCard = ({ item }) => {
  const { payload, user, occurred_at } = item;
  const { badge_title, badge_level, category_label } = payload ?? {};

  const level = badge_level ?? 1;
  const colors = BADGE_LEVEL_COLORS[level] ?? BADGE_LEVEL_COLORS[1];
  const [borderClass, bgClass, textClass] = colors.trim().split(/\s+/);

  return (
    <div className="rounded-lg p-3 bg-teal-400/10 backdrop-blur-lg relative overflow-hidden">
      <BorderSvg strokeWidth={0.6} />
      <div className="absolute left-0 top-0 w-[40%] h-[30%] rounded-full blur-[70px] -z-1 bg-violet-500 opacity-20" />

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
          className={`h-12 w-12 rounded-full border flex items-center justify-center shrink-0 ${borderClass} ${bgClass} ${textClass}`}
        >
          <IoRibbonOutline size={22} />
        </div>
        <div>
          <p className="text-sm font-semibold text-cream leading-tight">
            Earned a new badge!
          </p>
          <p className="text-xs secondary text-chino/70 mt-0.5">
            <span className={`font-semibold ${textClass}`}>{badge_title}</span>
            {category_label ? ` · ${category_label}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;
