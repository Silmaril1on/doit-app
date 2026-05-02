import React from "react";
import ItemCard from "../../components/container/ItemCard";
import ImageTag from "@/app/[locale]/components/elements/ImageTag";
import { timeAgo } from "@/app/[locale]/lib/utils/utils";
import { FaHandshake } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";

const TYPE_LABELS = {
  levelup: "LEVEL UP",
  badge: "ACHIEVED",
  friendship: "NEW FRIENDSHIP",
};

const UserSlot = ({ u, reverse = false }) => {
  const fullName = [u?.first_name, u?.last_name].filter(Boolean).join(" ");
  const initials = (
    u?.first_name?.[0] ??
    u?.display_name?.[0] ??
    "?"
  ).toUpperCase();

  return (
    <Link
      href={u?.display_name ? `/${u.display_name}` : "#"}
      className={`flex items-center gap-2.5 hover:opacity-75 transition-opacity ${reverse ? "flex-row-reverse" : ""}`}
    >
      <div className="h-12 w-12 shrink-0 relative overflow-hidden rounded-md border border-teal-500/30 bg-black/40">
        {u?.image_url ? (
          <ImageTag
            src={u.image_url}
            alt={u.display_name ?? "user"}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold text-sm text-teal-400">
            {initials}
          </div>
        )}
      </div>
      <div className={`min-w-0 ${reverse ? "text-right" : ""}`}>
        <p className="text-sm font-bold text-cream leading-tight truncate">
          {u?.display_name}
        </p>
        {fullName && (
          <p className="text-xs secondary text-chino/70 mt-0.5 truncate">
            {fullName}
          </p>
        )}
      </div>
    </Link>
  );
};

const ImageSlot = ({ src, alt }) => (
  <div className="h-12 w-12 shrink-0 relative overflow-hidden rounded-md border border-white/10 bg-white/5">
    {src && (
      <ImageTag
        src={src}
        alt={alt ?? ""}
        fill
        sizes="48px"
        className="object-cover"
      />
    )}
  </div>
);

const FeedCard = ({ item }) => {
  const { _type, user, friend, payload, occurred_at } = item ?? {};
  const label = TYPE_LABELS[_type] ?? _type?.toUpperCase() ?? "EVENT";

  return (
    <ItemCard>
      <div className="leading-none mb-3">
        <p className="text-cream font-bold tracking-wide">{label}</p>
        <p className="text-[10px] secondary text-chino">
          {timeAgo(occurred_at)}
        </p>
      </div>

      <div className="grid grid-cols-[1.5fr_1.9fr] gap-3">
        {/* Left — always the friend's data */}
        <UserSlot u={_type === "friendship" ? friend : user} />

        {/* Right — per event type */}
        {_type === "friendship" && (
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="h-9 w-9 rounded-full border border-teal-500/40 bg-teal-500/10 text-teal-300 flex items-center justify-center">
                <FaHandshake size={16} />
              </div>
              <p className="text-[9px] secondary text-teal-400/70">
                Now friends
              </p>
            </div>
            <UserSlot u={user} reverse />
          </div>
        )}

        {_type === "badge" && (
          <div className="flex items-center justify-end gap-2">
            <div className="text-right min-w-0">
              <p className="text-sm font-semibold text-cream leading-tight">
                Just Earned New badge!
              </p>
              <p className="text-xs secondary text-chino/70 mt-0.5 truncate">
                <span className="font-semibold text-teal-300">
                  {payload?.badge_title}
                </span>
                {payload?.category_label ? ` · ${payload.category_label}` : ""}
              </p>
            </div>
            <ImageSlot
              src={payload?.badge_image_url}
              alt={payload?.badge_title}
            />
          </div>
        )}

        {_type === "levelup" && (
          <div className="flex items-center justify-end gap-2">
            <div className="text-right min-w-0">
              <p className="text-sm font-semibold text-cream leading-tight">
                Just Reached level{" "}
                {payload?.current_level ?? payload?.new_level}!
              </p>
              {payload?.badge && (
                <p className="text-xs secondary text-chino/70 mt-0.5">
                  and acquired{" "}
                  <span className="font-semibold text-orange-400">
                    {String(payload.badge).charAt(0).toUpperCase() +
                      String(payload.badge).slice(1)}
                  </span>{" "}
                  badge
                </p>
              )}
            </div>
            <ImageSlot
              src={payload?.level_image_url}
              alt={`Level ${payload?.current_level ?? payload?.new_level}`}
            />
          </div>
        )}
      </div>
    </ItemCard>
  );
};

export default FeedCard;
