"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import AppImage from "@/app/[locale]/components/elements/ImageTag";
import Button from "@/app/[locale]/components/buttons/Button";
import {
  acceptFriendRequest,
  declineFriendRequest,
} from "@/app/[locale]/lib/services/user/friendships";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";

// ─── shared ──────────────────────────────────────────────────────────────────

const Avatar = ({ imageUrl, displayName, initials }) => (
  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-teal-500/30 bg-black/40">
    {imageUrl ? (
      <AppImage
        src={imageUrl}
        alt={displayName}
        fill
        className="object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-teal-400">
        {initials || "?"}
      </div>
    )}
  </div>
);

const LocationLine = ({ city, country }) => {
  const location = [city, country].filter(Boolean).join(", ");
  if (!location) return null;
  return <p className="secondary text-xs text-cream/30 truncate">{location}</p>;
};

// ─── request card ─────────────────────────────────────────────────────────────

const RequestCard = ({ req, onAction }) => {
  const [loading, setLoading] = useState(null);
  const { requester } = req;

  const fullName = [requester?.first_name, requester?.last_name]
    .filter(Boolean)
    .join(" ");
  const initials = [requester?.first_name, requester?.last_name]
    .filter(Boolean)
    .map((n) => n[0])
    .join("");

  const handle = async (action) => {
    setLoading(action);
    await onAction(req.id, action);
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-teal-500/15 bg-teal-500/5 px-4 py-3 transition-colors duration-200">
      <Avatar
        imageUrl={requester?.image_url}
        displayName={requester?.display_name}
        initials={initials}
      />

      <div className="min-w-0 flex-1">
        {fullName && (
          <p className="secondary text-sm font-semibold text-cream truncate">
            {fullName}
          </p>
        )}
        <p className="secondary text-xs text-teal-400 truncate">
          @{requester?.display_name ?? "unknown"}
        </p>
        {requester?.email && (
          <p className="secondary text-xs text-cream/40 truncate">
            {requester.email}
          </p>
        )}
        <LocationLine city={requester?.city} country={requester?.country} />
      </div>

      <div className="flex gap-2 shrink-0">
        <Button
          text={loading === "accept" ? "…" : "Accept"}
          size="sm"
          variant="fill"
          disabled={loading !== null}
          onClick={() => handle("accept")}
        />
        <Button
          text={loading === "decline" ? "…" : "Decline"}
          size="sm"
          variant="outline"
          disabled={loading !== null}
          onClick={() => handle("decline")}
        />
      </div>
    </div>
  );
};

// ─── friend card ──────────────────────────────────────────────────────────────

const FriendCard = ({ entry }) => {
  const { friend, friends_since } = entry;

  const fullName = [friend?.first_name, friend?.last_name]
    .filter(Boolean)
    .join(" ");
  const initials = [friend?.first_name, friend?.last_name]
    .filter(Boolean)
    .map((n) => n[0])
    .join("");

  const since = friends_since
    ? new Date(friends_since).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-teal-500/15 bg-teal-500/5 px-4 py-3 transition-colors duration-200">
      <Avatar
        imageUrl={friend?.image_url}
        displayName={friend?.display_name}
        initials={initials}
      />

      <div className="min-w-0 flex-1">
        {fullName && (
          <p className="secondary text-sm font-semibold text-cream truncate">
            {fullName}
          </p>
        )}
        <p className="secondary text-xs text-teal-400 truncate">
          @{friend?.display_name ?? "unknown"}
        </p>
        {friend?.email && (
          <p className="secondary text-xs text-cream/40 truncate">
            {friend.email}
          </p>
        )}
        <LocationLine city={friend?.city} country={friend?.country} />
      </div>

      {since && (
        <p className="secondary text-xs text-cream/30 shrink-0 text-right">
          Friends since
          <br />
          <span className="text-teal-400/60">{since}</span>
        </p>
      )}
    </div>
  );
};

// ─── main ─────────────────────────────────────────────────────────────────────

const Friendship = ({ requests, friends }) => {
  const [requestList, setRequestList] = useState(requests);
  const dispatch = useDispatch();

  const handleAction = async (friendshipId, action) => {
    try {
      if (action === "accept") {
        await acceptFriendRequest(friendshipId);
        dispatch(
          setToast({ msg: "Friend request accepted!", type: "success" }),
        );
      } else {
        await declineFriendRequest(friendshipId);
        dispatch(
          setToast({ msg: "Friend request declined.", type: "success" }),
        );
      }
      setRequestList((prev) => prev.filter((r) => r.id !== friendshipId));
    } catch (err) {
      dispatch(setToast({ msg: err.message, type: "error" }));
    }
  };

  return (
    <div className="page-wrapper  max-w-xl mx-auto flex flex-col gap-10">
      {/* ── Pending requests ── */}
      <section>
        <h1 className="primary text-2xl text-cream mb-1">Friend Requests</h1>
        <p className="secondary text-xs text-cream/40 mb-6">
          {requestList.length} pending
        </p>

        {requestList.length === 0 ? (
          <p className="secondary text-sm text-cream/40 text-center py-8">
            No pending friend requests.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {requestList.map((req) => (
              <RequestCard key={req.id} req={req} onAction={handleAction} />
            ))}
          </div>
        )}
      </section>

      {/* ── Friends list ── */}
      <section>
        <h2 className="primary text-2xl text-cream mb-1">Friends</h2>
        <p className="secondary text-xs text-cream/40 mb-6">
          {friends.length} connected
        </p>

        {friends.length === 0 ? (
          <p className="secondary text-sm text-cream/40 text-center py-8">
            No friends yet. Start connecting!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {friends.map((entry) => (
              <FriendCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Friendship;
