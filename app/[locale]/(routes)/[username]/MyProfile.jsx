"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useSWR from "swr";
import { sendFriendRequest } from "../../lib/services/user/friendships";
import { setToast } from "../../lib/features/toastSlice";
import Button from "../../components/buttons/Button";
import { CountryFlags } from "../../components/elements/CountryFlags";
import { formatDate } from "../../lib/utils/utils";
import { FaUsers, FaGamepad, FaCoins } from "react-icons/fa";
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
import { getEarnedTiers } from "../../lib/local-bd/levelProgressData";
import ImageTag from "../../components/elements/ImageTag";
import IconTag from "../../components/elements/IconTag";
import { selectColorValue } from "../../lib/features/configSlice";
import { THEME } from "../../lib/utils/themeClasses";

const friendshipFetcher = (url) => fetch(url).then((r) => r.json());

const MyProfile = ({
  user: serverUser,
  xp,
  friendsCount,
  objectiveStats,
  badgeProgress = [],
  tokens = 0,
}) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isOwner =
    currentUser?.id && serverUser?.id && currentUser.id === serverUser.id;

  // Only subscribe to SWR when viewing your own profile so live updates work
  const { profile: liveProfile } = useUserProfile(isOwner ? serverUser : null);

  // For the owner, overlay fresh SWR data on top of the SSR prop
  const user =
    isOwner && liveProfile ? { ...serverUser, ...liveProfile } : serverUser;

  const totalXp = xp?.total_xp ?? 0;
  const formattedXp = totalXp.toLocaleString();
  const currentLevel = xp?.current_level ?? 1;
  const currentTokens = isOwner && user?.token != null ? user.token : tokens;

  // Friendship status — only fetch when viewing another user's profile
  const friendshipSWRKey =
    !isOwner && currentUser && serverUser?.id
      ? `/api/friends/status?userId=${serverUser.id}`
      : null;
  const { data: friendshipData, mutate: mutateFriendship } = useSWR(
    friendshipSWRKey,
    friendshipFetcher,
    { revalidateOnFocus: false },
  );

  const friendshipStatus = friendshipData?.status ?? "none";
  const friendshipId = friendshipData?.friendshipId ?? null;

  const handleAdd = async () => {
    setLoading(true);
    try {
      const result = await sendFriendRequest(user?.id);
      dispatch(setToast({ msg: "Friend request sent!", type: "success" }));
      mutateFriendship(
        { status: "pending_sent", friendshipId: result.id },
        { revalidate: false },
      );
    } catch (err) {
      dispatch(setToast({ msg: err.message, type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendshipId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/friends?friendshipId=${friendshipId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      dispatch(setToast({ msg: "Friend removed.", type: "success" }));
      mutateFriendship({ status: "none" }, { revalidate: false });
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
        tokens={currentTokens}
        loading={loading}
      />
      <UserAvatarSection
        user={user}
        isOwner={isOwner}
        friendshipStatus={friendshipStatus}
        loading={loading}
        handleAdd={handleAdd}
        handleRemoveFriend={handleRemoveFriend}
      />
      <ProfileSection user={user} />
      <BadgesSection badgeProgress={badgeProgress} xp={xp} />
      <Stats objectiveStats={objectiveStats} />
    </div>
  );
};

const UserAvatarSection = ({
  user,
  isOwner,
  friendshipStatus,
  loading,
  handleAdd,
  handleRemoveFriend,
}) => {
  const { open } = useModal();

  const buttonText = (() => {
    if (isOwner) return null;
    if (friendshipStatus === "accepted") return "Delete Friend";
    if (friendshipStatus === "pending_sent") return "Pending";
    if (friendshipStatus === "pending_received") return "Accept";
    return "Add Friend";
  })();

  const handleClick = () => {
    if (friendshipStatus === "accepted") return handleRemoveFriend();
    return handleAdd();
  };

  return (
    <div className="relative h-44 flex items-center justify-start">
      <div className="absolute top-0 right-0 z-5">
        {isOwner && (
          <ActionButton
            variant="edit"
            className="absolute top-3 right-3"
            onClick={() => open("editProfile", { profile: user })}
          />
        )}
      </div>
      <div className="absolute w-[85%] right-0 h-44 z-0">
        <ItemCard className="h-full overflow-hidden p-0">
          {user?.wallpaper_image_url ? (
            <div className="relative w-full h-full rounded-sm overflow-hidden">
              <ImageTag
                fill
                src={user.wallpaper_image_url}
                alt="Cover photo"
                className="object-cover"
              />
            </div>
          ) : null}
        </ItemCard>
      </div>
      <ItemCard bg="bg-black/30" className="shadow-2xl">
        <AvatarTag
          size="xl"
          user={user}
          text={buttonText}
          onClick={handleClick}
          buttonDisabled={friendshipStatus === "pending_sent" || loading}
          buttonLoading={loading && friendshipStatus !== "pending_sent"}
        />
      </ItemCard>
    </div>
  );
};

const HeaderSection = ({ totalXp, currentLevel, friendsCount, tokens }) => {
  const colorTheme = useSelector(selectColorValue) ?? "teal";
  const t = THEME[colorTheme] ?? THEME.teal;

  const stats = [
    {
      label: "Tokens",
      value: (tokens ?? 0).toLocaleString(),
      icon: <FaCoins />,
    },
    { label: "Total XP", value: totalXp, icon: <FaGamepad /> },
    { label: "Level", value: currentLevel, icon: <MdFavorite /> },
    { label: "Friends", value: friendsCount, icon: <FaUsers /> },
  ];

  return (
    <div className="flex items-center justify-end gap-3 mt-1">
      {stats.map(({ label, value, icon }) => (
        <div
          key={label}
          className={`rounded-xl center gap-2 border px-2 ${t.statBorder} ${t.statBg}`}
        >
          <IconTag icon={icon} />
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
      return name || null;
    }
    return user?.[key] || null;
  };

  const hasValue = (key) => {
    if (
      key === "created_at" ||
      key === "email_verified" ||
      key === "display_name"
    )
      return true;
    if (key === "full_name") return !!(user?.first_name || user?.last_name);
    if (key === "origin") return !!(user?.country || user?.city);
    return !!user?.[key];
  };

  const getValueClass = (key) => {
    if (key === "email_verified")
      return user?.email_verified ? "text-green-400" : "text-red-400";
    return "text-cream";
  };

  const visibleFields = PROFILE_FIELDS.filter(({ key }) => hasValue(key));

  return (
    <ItemCard className="relative">
      <h2 className="text-cream mb-3 font-bold text-2xl">Basic information</h2>
      <div className="grid grid-cols-2 gap-3">
        {visibleFields.map(({ key, label }) => (
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

const BADGE_LIMIT = 6;

const BadgesSection = ({ badgeProgress = [], xp = {} }) => {
  // Expand every earned category tier into individual badge entries
  const categoryBadges = badgeProgress
    .filter((p) => p.current_level > 0)
    .flatMap((p) => {
      const tiers = CATEGORY_ACHIEVEMENT_TIERS[p.category_id] ?? [];
      const category = TASK_CATEGORIES.find((c) => c.id === p.category_id);
      return tiers
        .filter((t) => t.level <= p.current_level)
        .map((t) => ({
          id: `cat-${p.category_id}-${t.level}`,
          displayLevel: t.level,
          title: t.title,
          subtitle: category?.label ?? "",
          // Higher tiers within a category were earned later → sort by level desc within category
          sortKey: new Date(p.created_at ?? 0).getTime() + t.level,
        }));
    });

  // Level badges derived from XP current_level
  const levelBadges = getEarnedTiers(xp?.current_level ?? 1).map((t) => ({
    id: `lvl-${t.threshold}`,
    displayLevel: t.threshold,
    title: t.name,
    subtitle: "Level Badge",
    // No stored timestamp; treat as last in list, ordered by threshold desc
    sortKey: t.threshold,
  }));

  // Merge: category badges sorted by recency first, then level badges by threshold
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
            className="flex flex-col items-center gap-2 rounded-xl border border-teal-500/40 bg-teal-500/10 p-4 text-center"
          >
            <div className="h-12 w-12 rounded-full border border-teal-400 bg-teal-500 flex items-center justify-center shrink-0">
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

export default MyProfile;
