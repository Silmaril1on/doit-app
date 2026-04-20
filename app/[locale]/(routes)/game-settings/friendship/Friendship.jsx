"use client";
import { useState } from "react";
import useSWR from "swr";
import { useDispatch } from "react-redux";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";
import { CountryFlags } from "@/app/[locale]/components/elements/CountryFlags";
import Button from "@/app/[locale]/components/buttons/Button";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import AvatarTag from "@/app/[locale]/components/elements/AvatarTag";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import {
  acceptFriendRequest,
  declineFriendRequest,
} from "@/app/[locale]/lib/services/user/friendships";
import { timeAgo } from "@/app/[locale]/lib/utils/utils";

const PersonCard = ({ person, children }) => {
  const fullName = [person?.first_name, person?.last_name]
    .filter(Boolean)
    .join(" ");
  const initials = [person?.first_name, person?.last_name]
    .filter(Boolean)
    .map((n) => n[0])
    .join("");

  return (
    <ItemCard className="gap-3 center">
      <AvatarTag
        imageUrl={person?.image_url}
        displayName={person?.display_name}
        initials={initials}
      />
      <div className="min-w-0 flex-1">
        <p className="secondary capitalize text-sm font-semibold text-cream">
          {fullName || person?.display_name}
        </p>
        <CountryFlags
          title
          countryName={person?.country}
          cityName={person?.city}
          size="sm"
        />
      </div>
      {children}
    </ItemCard>
  );
};

const RequestCard = ({ req, onAction }) => {
  const [loading, setLoading] = useState(null);

  const handle = async (action) => {
    setLoading(action);
    await onAction(req, action);
    setLoading(null);
  };

  return (
    <PersonCard person={req.requester}>
      <div className="flex gap-2 shrink-0">
        <Button
          text="Accept"
          size="sm"
          variant="fill"
          loading={loading === "accept"}
          disabled={loading !== null}
          onClick={() => handle("accept")}
        />
        <Button
          text="Decline"
          size="sm"
          variant="outline"
          loading={loading === "decline"}
          disabled={loading !== null}
          onClick={() => handle("decline")}
        />
      </div>
    </PersonCard>
  );
};

const FriendCard = ({ entry }) => {
  const since = entry.friends_since;

  return (
    <PersonCard person={entry.friend}>
      {since && (
        <p className="secondary text-xs text-cream/30 shrink-0 text-right">
          Friends since
          <br />
          <span className="text-teal-400/60">{timeAgo(since)}</span>
        </p>
      )}
    </PersonCard>
  );
};

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

const Friendship = ({ requests, friends }) => {
  const { data: requestsData, mutate: mutateRequests } = useSWR(
    "/api/add-friend",
    fetcher,
    {
      fallbackData: { requests },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 600000,
    },
  );

  const { data: friendsData, mutate: mutateFriends } = useSWR(
    "/api/friends",
    fetcher,
    {
      fallbackData: { friends },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 600000,
    },
  );

  const requestList = requestsData?.requests ?? [];
  const friendsList = friendsData?.friends ?? [];
  const dispatch = useDispatch();

  const handleAction = async (req, action) => {
    const friendshipId = req.id;
    try {
      if (action === "accept") {
        mutateRequests(
          (current) => {
            const next = (current?.requests ?? []).filter(
              (r) => r.id !== friendshipId,
            );
            return { ...(current ?? {}), requests: next };
          },
          { revalidate: false },
        );

        mutateFriends(
          (current) => {
            const prev = current?.friends ?? [];
            const exists = prev.some((f) => f.id === friendshipId);
            if (exists) return current;
            const optimisticFriend = {
              id: friendshipId,
              friends_since: new Date().toISOString(),
              friend: req.requester ?? null,
            };
            return { ...(current ?? {}), friends: [optimisticFriend, ...prev] };
          },
          { revalidate: false },
        );

        await acceptFriendRequest(friendshipId);
        dispatch(
          setToast({ msg: "Friend request accepted!", type: "success" }),
        );
        mutateRequests();
        mutateFriends();
      } else {
        await declineFriendRequest(friendshipId);
        dispatch(
          setToast({ msg: "Friend request declined.", type: "success" }),
        );
        mutateRequests();
      }
    } catch (err) {
      mutateRequests();
      mutateFriends();
      dispatch(setToast({ msg: err.message, type: "error" }));
    }
  };

  return (
    <div className="page-wrapper flex flex-col gap-5">
      {/* ── Pending requests ── */}
      <section className="space-y-2 ">
        <SectionHeadline
          title="Friend Requests"
          subtitle={`${requestList.length} pending`}
        />
        {requestList.length === 0 ? (
          <p className="secondary text-sm text-cream/40 text-center py-8">
            No pending friend requests.
          </p>
        ) : (
          <div className="flex flex-col gap-3 pb-2">
            {requestList.map((req) => (
              <RequestCard key={req.id} req={req} onAction={handleAction} />
            ))}
          </div>
        )}
      </section>

      {/* ── Friends list ── */}
      <section className="space-y-2">
        <SectionHeadline
          title="Friends"
          subtitle={`${friendsList.length} connected`}
        />
        {friendsList.length === 0 ? (
          <p className="secondary text-sm text-cream/40 text-center py-8">
            No friends yet. Start connecting!
          </p>
        ) : (
          <div className="flex flex-col gap-3 pb-2">
            {friendsList.map((entry) => (
              <FriendCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Friendship;
