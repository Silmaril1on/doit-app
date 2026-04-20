import React from "react";
import AvatarTag from "@/app/[locale]/components/elements/AvatarTag";
import ItemCard from "../../components/container/ItemCard";
import { FaHandshake } from "react-icons/fa6";
import { timeAgo } from "@/app/[locale]/lib/utils/utils";

const FriendshipCard = ({ item }) => {
  const { user, friend, occurred_at } = item;

  return (
    <ItemCard>
      <div className="leading-none">
        <p className="text-cream font-bold tracking-wide">NEW FRIENDSHIP</p>
        <p className="text-[10px] secondary text-chino mb-3">
          {timeAgo(occurred_at)}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <AvatarTag user={user} size="md" label={true} className="w-[38%]" />
        <div className="flex flex-col items-center gap-1 w-[24%]">
          <div className="h-11 w-11 rounded-full border border-teal-500/40 bg-teal-500/10 text-teal-300 flex items-center justify-center">
            <FaHandshake size={22} />
          </div>
          <p className="text-[9px] secondary text-teal-400/70 text-center leading-tight">
            Now friends
          </p>
        </div>
        <AvatarTag user={friend} size="md" label={true} className="w-[38%]" />
      </div>
    </ItemCard>
  );
};

export default FriendshipCard;
