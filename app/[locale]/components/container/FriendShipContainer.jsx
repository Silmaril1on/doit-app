"use client";
import { useState } from "react";
import Button from "../buttons/Button";
import { useParams } from "next/navigation";
import AvatarTag from "../elements/AvatarTag";
import ItemCard from "./ItemCard";
import useSWR from "swr";
import ToggleButton from "../buttons/ToggleButton";
import UserSearch from "../forms/UserSearch";
import TimeNow from "../elements/TimeNow";

const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to load data");
  return response.json();
};

const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 30000,
  keepPreviousData: true,
};

const FriendShipContainer = ({ onUserNavigate }) => {
  const [tab, setTab] = useState("friends");
  const [actionLoading, setActionLoading] = useState(null);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const [actionError, setActionError] = useState("");

  const friendsSWR = useSWR("/api/friends", fetcher, {
    ...swrOptions,
  });
  const requestsSWR = useSWR(
    tab === "requests" ? "/api/add-friend" : null,
    fetcher,
    {
      ...swrOptions,
    },
  );

  const activeSWR = tab === "friends" ? friendsSWR : requestsSWR;
  const items =
    tab === "friends"
      ? (friendsSWR.data?.friends ?? [])
      : (requestsSWR.data?.requests ?? []);
  const loading = activeSWR.isLoading;
  const error = activeSWR.error;
  const friendsCount = friendsSWR.data?.friends?.length ?? 0;
  const requestsCount = requestsSWR.data?.requests?.length ?? 0;
  const headerText =
    tab === "friends"
      ? `You have ${friendsCount} friends`
      : `You have ${requestsCount} requests`;

  async function handleAction(friendshipId, action) {
    try {
      setActionError("");
      setActionLoading(`${friendshipId}:${action}`);
      const response = await fetch("/api/add-friend", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId, action }),
      });
      if (!response.ok) throw new Error(`Failed to ${action} request`);

      await requestsSWR.mutate(
        (current) => {
          if (!current?.requests) return current;
          return {
            ...current,
            requests: current.requests.filter((r) => r.id !== friendshipId),
          };
        },
        { revalidate: false },
      );
      if (action === "accept") friendsSWR.mutate();
    } catch (err) {
      setActionError(err?.message ?? "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  function renderItem(item) {
    const user = tab === "friends" ? item.friend : item.requester;
    if (!user) return null;
    const profileHref = user?.display_name
      ? `/${locale}/${encodeURIComponent(user.display_name)}`
      : null;
    return (
      <ItemCard key={item.id}>
        <div className="flex items-center justify-between ">
          <AvatarTag
            user={user}
            size="lg"
            label={true}
            href={profileHref}
            onClick={onUserNavigate}
          />
          {tab === "friends" && item?.friends_since && (
            <p className="secondary text-xs text-cream/30 shrink-0 text-right">
              Friends since
              <br />
              <TimeNow date={item.friends_since} />
            </p>
          )}
          {tab === "requests" && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                text="Accept"
                size="sm"
                loading={actionLoading === `${item.id}:accept`}
                disabled={actionLoading !== null}
                onClick={() => handleAction(item.id, "accept")}
              />
              <Button
                text="Decline"
                size="sm"
                variant="outline"
                loading={actionLoading === `${item.id}:decline`}
                disabled={actionLoading !== null}
                onClick={() => handleAction(item.id, "decline")}
              />
            </div>
          )}
        </div>
      </ItemCard>
    );
  }

  function renderContent() {
    if (error)
      return (
        <p className="text-red-300/80 text-sm text-center mt-8">
          Failed to load. Pull to refresh.
        </p>
      );
    if (loading)
      return (
        <p className="text-teal-500/60 text-sm text-center mt-8">Loading…</p>
      );
    if (items.length === 0) {
      const empty =
        tab === "friends" ? "No friends yet." : "No pending requests.";
      return (
        <p className="text-teal-500/60 text-sm text-center mt-8">{empty}</p>
      );
    }
    return items.map(renderItem);
  }

  return (
    <div className="h-full relative flex flex-col bg-primary/15 rounded-br-3xl w-full shadow-[2px_0_10px_2px_rgba(var(--color-shadow),0.6)]">
      <div className="absolute z-0 -bottom-14 left-0 bg-primary/15 inverted" />
      {/* Tab Toggle */}
      <div className="flex flex-col items-center gap-3 py-3 shrink-0 ">
        <ToggleButton
          variant="layout"
          options={["friends", "requests"]}
          value={tab}
          onChange={setTab}
        />
        <UserSearch />
      </div>

      <h1 className="text-chino secondary text-sm text-start pl-4">
        {headerText}
      </h1>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {actionError && (
          <p className="text-red-300/80 text-xs text-center">{actionError}</p>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default FriendShipContainer;
