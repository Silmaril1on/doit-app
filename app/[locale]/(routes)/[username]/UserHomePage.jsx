"use client";
import React, { useState } from "react";
import AppImage from "../../components/elements/ImageTag";
import { useDispatch, useSelector } from "react-redux";
import { sendFriendRequest } from "../../lib/services/user/friendships";
import { setToast } from "../../lib/features/toastSlice";
import Button from "../../components/buttons/Button";
import { CountryFlags } from "../../components/elements/CountryFlags";
import { timeAgo, formatDate } from "../../lib/utils/utils";
import { FaUsers, FaGamepad } from "react-icons/fa";
import { MdFavorite } from "react-icons/md";
import ItemCard from "../../components/container/ItemCard";
import AvatarTag from "../../components/elements/AvatarTag";
import ActionButton from "../../components/buttons/ActionButton";
import { useModal } from "../../lib/hooks/useModal";
import { useUserProfile } from "../../lib/hooks/userProfileHook";
import { selectCurrentUser } from "../../lib/features/userSlice";
import {
  TASK_CATEGORIES,
  CATEGORY_ACHIEVEMENT_TIERS,
  getTierByLevel,
} from "../../lib/local-bd/categoryTypesData";
import SectionHeadline from "../../components/elements/SectionHeadline";

const UserHomePage = ({ user: serverUser, xp, friendsCount, objectiveStats, badgeProgress = [] }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isOwner = currentUser?.id && serverUser?.id && currentUser.id === serverUser.id;

  // Only subscribe to SWR when viewing your own profile so live updates work
  const { profile: liveProfile } = useUserProfile(isOwner ? serverUser : null);

  // For the owner, overlay fresh SWR data on top of the SSR prop
  const user = isOwner && liveProfile ? { ...serverUser, ...liveProfile } : serverUser;

  const totalXp = xp?.total_xp ?? 0;
  const formattedXp = totalXp.toLocaleString();
  const currentLevel = xp?.current_level ?? 1;

  const handleAdd = async () => {
    setLoading(true);
    try {
      await sendFriendRequest(user?.id);
      dispatch(setToast({ msg: "Friend request sent!", type: "success" }));
    } catch (err) {
      dispatch(setToast({ msg: err.message, type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col *:w-full space-y-5 px-4 pb-19 pt-17 bg-black">
      <HeaderSection
        totalXp={formattedXp}
        currentLevel={currentLevel}
        friendsCount={friendsCount ?? 0}
        loading={loading}
      />
      <UserAvatarSection user={user} handleAdd={handleAdd} loading={loading} />
      <ProfileSection user={user} />
      <BadgesSection badgeProgress={badgeProgress} />
      <Stats objectiveStats={objectiveStats} />
    </div>
  );
};

const UserAvatarSection = ({ user, handleAdd, loading }) => {
  const { open } = useModal();

  return (
    <div className="relative h-44 flex items-center justify-start">
      <div className="absolute top-0 right-0 z-5">
        <ActionButton
          variant="edit"
          className="absolute top-3 right-3"
          onClick={() => open("editProfile", { profile: user })}
        />
      </div>
      <div className="absolute w-[85%] right-0 h-44 z-0">
        <ItemCard className="h-full overflow-hidden p-0">
          {user?.wallpaper_image_url ? (
            <div className="relative w-full h-full">
              <AppImage
                fill
                src={user.wallpaper_image_url}
                alt="Cover photo"
                className="object-cover"
              />
            </div>
          ) : null}
        </ItemCard>
      </div>
      <ItemCard className="z-2 bg-black/50 backdrop-blur-lg">
        <AvatarTag
          size="xl"
          user={user}
          text="Add Friend"
          onClick={handleAdd}
        />
      </ItemCard>
    </div>
  );
};

const HeaderSection = ({ totalXp, currentLevel, friendsCount }) => {
  const stats = [
    { label: "Total XP", value: totalXp, icon: <FaGamepad /> },
    { label: "Level", value: currentLevel, icon: <MdFavorite /> },
    { label: "Friends", value: friendsCount, icon: <FaUsers /> },
  ];

  return (
    <div className="flex items-center justify-end gap-3 mt-1">
      {stats.map(({ label, value, icon }) => (
        <div
          key={label}
          className="rounded-xl center gap-2 border px-2 border-teal-500/15 bg-teal-500/30"
        >
          <span className="text-teal-500">{icon}</span>
          <p className="secondary pt-0.5 text-[10px] text-chino uppercase">
            {label}
          </p>
          <p className="text-cream text-md font-semibold pt-1 leading-none">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
};

const PROFILE_FIELDS = [
  { key: "display_name", label: "Alias" },
  { key: "full_name", label: "Full Name" },
  { key: "date", label: "Date of Birth" },
  { key: "sex", label: "Sex" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "origin", label: "Origin" },
  { key: "created_at", label: "Member Since" },
  { key: "email_verified", label: "Status" },
];

const ProfileSection = ({ user }) => {
  const getValue = (key) => {
    if (key === "created_at") return formatDate(user?.created_at);
    if (key === "email_verified")
      return user?.email_verified ? "Verified" : "Unverified";
    if (key === "full_name") {
      const name = [user?.first_name, user?.last_name]
        .filter(Boolean)
        .join(" ");
      return name || "—";
    }
    return user?.[key] || "—";
  };

  const getValueClass = (key) => {
    if (key === "email_verified")
      return user?.email_verified ? "text-green-400" : "text-red-400";
    return "text-cream";
  };

  return (
    <ItemCard className="relative">
      <h2 className="text-cream mb-3 font-bold text-2xl">Basic information</h2>
      <div className="grid grid-cols-2 gap-3">
        {PROFILE_FIELDS.map(({ key, label }) => (
          <div
            key={key}
            className="px-3 py-2 space-y-0.5 border border-teal-500/20 bg-black/30 backdrop-blur-lg rounded-md"
          >
            <p className="text-chino/60 text-[10px] secondary font-bold">
              {label}
            </p>
            {key === "origin" ? (
              <CountryFlags
                countryName={user?.country}
                cityName={user?.city}
                title
                size="md"
              />
            ) : (
              <p
                className={`text-sm font-medium secondary capitalize ${getValueClass(key)}`}
              >
                {getValue(key)}
              </p>
            )}
          </div>
        ))}
      </div>
    </ItemCard>
  );
};

const SEGMENTS = 5;

const BadgesSection = ({ badgeProgress }) => {
  const earned = badgeProgress.filter((p) => p.current_level > 0);
  if (earned.length === 0) return null;

  return (
    <ItemCard className="space-y-3">
      <SectionHeadline
        title="Badges"
        subtitle={`${earned.length} categor${earned.length !== 1 ? "ies" : "y"} unlocked`}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {earned.map((p) => {
          const tier = getTierByLevel(p.category_id, p.current_level);
          const tiers = CATEGORY_ACHIEVEMENT_TIERS[p.category_id] ?? [];
          const nextTier = tiers.find((t) => t.level === p.current_level + 1) ?? null;
          const category = TASK_CATEGORIES.find((c) => c.id === p.category_id);

          return (
            <div
              key={p.category_id}
              className="flex flex-col items-center gap-2 rounded-xl border border-teal-500/40 bg-teal-500/10 p-4 text-center"
            >
              {/* Badge level circle */}
              <div className="h-12 w-12 rounded-full border border-teal-400 bg-teal-500 flex items-center justify-center shrink-0">
                <span className="text-black font-bold text-lg leading-none">
                  {p.current_level}
                </span>
              </div>

              {/* Tier title + category */}
              <div>
                <p className="text-cream text-xs font-bold leading-tight">
                  {tier?.title ?? `Level ${p.current_level}`}
                </p>
                <p className="text-chino/60 text-[10px] secondary mt-0.5">
                  {category?.label ?? ""}
                </p>
              </div>

              {/* Completed count */}
              <p className="text-teal-400 text-[10px] font-mono">
                {p.completed_count} completed
              </p>

              {/* Progress to next tier */}
              {nextTier && (
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-[9px] secondary text-chino/50">
                    <span>Next: {nextTier.title}</span>
                    <span>{p.completed_count}/{nextTier.required_count}</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (p.completed_count / nextTier.required_count) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ItemCard>
  );
};

const SEGMENTS_COUNT = 5;

const GameBar = ({ label, count, total, color }) => {
  const filled = total > 0 ? Math.round((count / total) * SEGMENTS_COUNT) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] tracking-widest secondary text-chino font-medium">
          {label}
        </span>
        <span className="text-[10px] text-teal-400 font-mono ">{count}</span>
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

const Stats = ({ objectiveStats }) => {
  const { byStatus = {}, byPriority = {}, total = 0 } = objectiveStats ?? {};

  return (
    <ItemCard className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-teal-500/15 bg-teal-500/5 p-4">
      <div className="space-y-4">
        <p className="text-[9px] uppercase tracking-[0.2em] text-teal-500/70 font-semibold">
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
        <p className="text-[9px] uppercase tracking-[0.2em] text-teal-500/70 font-semibold">
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

export default UserHomePage;
