import React from "react";
import Image from "next/image";
import { IoPersonAddOutline } from "react-icons/io5";
import BorderSvg from "@/app/[locale]/components/elements/BorderSvg";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const UserAvatar = ({ user, size = 32 }) =>
  user?.image_url ? (
    <Image
      src={user.image_url}
      alt={user.display_name ?? "user"}
      width={size}
      height={size}
      className="rounded-full object-cover shrink-0"
    />
  ) : (
    <div
      className="rounded-full bg-teal-500/20 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="text-xs font-bold text-teal-300 uppercase">
        {(user?.display_name ?? "?")[0]}
      </span>
    </div>
  );

const FriendshipCard = ({ item }) => {
  const { user, friend, occurred_at } = item;

  return (
    <div className="rounded-lg p-3 bg-teal-400/10 backdrop-blur-lg relative overflow-hidden">
      <BorderSvg strokeWidth={0.6} />
      <div className="absolute left-0 top-0 w-[40%] h-[30%] rounded-full blur-[70px] -z-1 bg-teal-400 opacity-30" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <UserAvatar user={user} />
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
        <div className="h-12 w-12 rounded-full border border-teal-500/40 bg-teal-500/10 text-teal-300 flex items-center justify-center shrink-0">
          <IoPersonAddOutline size={20} />
        </div>
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-semibold text-cream leading-tight">
              New friendship!
            </p>
            <p className="text-xs secondary text-chino/70 mt-0.5">
              Now friends with{" "}
              <span className="font-semibold text-teal-300">
                {friend?.display_name ?? "someone"}
              </span>
            </p>
          </div>
          {friend && <UserAvatar user={friend} size={28} />}
        </div>
      </div>
    </div>
  );
};

export default FriendshipCard;
