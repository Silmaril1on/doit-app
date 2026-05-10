"use client";
import React from "react";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import ImageTag from "@/app/[locale]/components/elements/ImageTag";

/**
 * Reusable display card for both TaskCategories and AchievementTiers.
 *
 * Props:
 *  image    – URL string for the badge/icon image
 *  title    – main label
 *  subtitle – secondary text (description for categories, title for tiers)
 *  meta     – array of { label, value } pairs shown as small tags
 *  onEdit   – callback to open the edit modal
 */
const BadgeCard = ({ image, title, subtitle, meta, onEdit }) => {
  return (
    <ItemCard className="flex items-center gap-4">
      {/* icon */}
      {image ? (
        <div className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-primary/20">
          <ImageTag
            src={image}
            alt={title}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="shrink-0 w-16 h-16 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center text-primary/30 text-2xl select-none">
          ?
        </div>
      )}

      {/* text */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="primary text-cream font-semibold text-sm truncate">
          {title}
        </p>
        {subtitle && (
          <p className="secondary text-chino/60 text-xs line-clamp-2">
            {subtitle}
          </p>
        )}
        {meta && meta.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-1">
            {meta.map((m) => (
              <span key={m.label} className="secondary text-xs text-chino/50">
                <span className="text-primary/70">{m.label}:</span> {m.value}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* edit action */}
      <div className="shrink-0">
        <ActionButton variant="edit" onClick={onEdit} />
      </div>
    </ItemCard>
  );
};

export default BadgeCard;
