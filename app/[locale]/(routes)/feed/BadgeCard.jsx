import React from "react";
import AvatarTag from "@/app/[locale]/components/elements/AvatarTag";
import ItemCard from "../../components/container/ItemCard";
import { IoRibbonOutline } from "react-icons/io5";
import { timeAgo } from "@/app/[locale]/lib/utils/utils";
import FormatedTime from "../../components/elements/FormatedTime";

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

const BadgeCard = ({ item }) => {
  const { payload, user, occurred_at } = item;
  const { badge_title, badge_level, category_label } = payload ?? {};

  const level = badge_level ?? 1;
  const colors = BADGE_LEVEL_COLORS[level] ?? BADGE_LEVEL_COLORS[1];
  const [borderClass, bgClass, textClass] = colors.trim().split(/\s+/);

  return (
    <ItemCard>
      <div className="flex items-center gap-3">
        <div className="flex gap-2 secondary">
          <AvatarTag user={user} size="md" />
          <div>
            <FormatedTime time={timeAgo(occurred_at)} />
            <p className="text-cream text-sm  font-bold">
              {user?.display_name}
            </p>
          </div>
        </div>

        {/* Right — badge info */}
        <div className="flex items-center justify-end gap-3 flex-1">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-cream leading-tight">
              Earned a new badge!
            </p>
            <p className="text-xs secondary text-chino/70 mt-0.5 truncate">
              <span className={`font-semibold ${textClass}`}>
                {badge_title}
              </span>
              {category_label ? ` · ${category_label}` : ""}
            </p>
          </div>
          <div
            className={`h-12 w-12 rounded-md border flex items-center justify-center shrink-0 ${borderClass} ${bgClass} ${textClass}`}
          >
            <IoRibbonOutline size={22} />
          </div>
        </div>
      </div>
    </ItemCard>
  );
};

export default BadgeCard;
