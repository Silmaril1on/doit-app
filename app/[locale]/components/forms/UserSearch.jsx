"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import SearchBar from "./SearchBar";
import ActionButton from "../buttons/ActionButton";
import AppImage from "../elements/ImageTag";
import { searchUsersByDisplayName } from "@/app/[locale]/lib/services/user/userProfiles";
import {
  sendFriendRequest,
  getFriendshipStatuses,
} from "@/app/[locale]/lib/services/user/friendships";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";
import { setTopEdgeCollapsed } from "@/app/[locale]/lib/features/topEdgeSlice";

const FRIEND_LABEL = {
  accepted: "in your friendlist",
  pending_sent: "request sent",
  pending_received: "wants to add you",
};

const UserCard = ({ user, onAdd, onNavigate, friendshipStatus }) => {
  const initials = [user.first_name, user.last_name]
    .filter(Boolean)
    .map((n) => n[0])
    .join("");

  const statusLabel = FRIEND_LABEL[friendshipStatus] ?? null;
  const canAdd = !statusLabel;

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-teal-500/10 rounded-xl transition-colors duration-200"
      onClick={() => onNavigate(user.display_name)}
    >
      {/* Avatar */}
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-teal-500/30 bg-black/40">
        {user.image_url ? (
          <AppImage
            src={user.image_url}
            alt={user.display_name}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-teal-400">
            {initials || "?"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="secondary text-sm font-semibold text-cream truncate">
          @{user.display_name}
        </p>
        {(user.first_name || user.last_name) && (
          <p className="secondary text-xs text-cream/50 truncate">
            {[user.first_name, user.last_name].filter(Boolean).join(" ")}
          </p>
        )}
        {user.email && (
          <p className="secondary text-xs text-teal-400/60 truncate">
            {user.email}
          </p>
        )}
        {statusLabel && (
          <p className="secondary text-[10px] text-green-400/80 mt-0.5">
            • {statusLabel}
          </p>
        )}
      </div>

      {/* Add button — only shown when no friendship exists */}
      {canAdd && (
        <ActionButton
          variant="add"
          ariaLabel="Send friend request"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(user.id);
          }}
        />
      )}
    </div>
  );
};

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState({});
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  // Generation counter: discard responses from superseded searches
  const searchGenRef = useRef(0);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const router = useRouter();
  const dispatch = useDispatch();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const gen = ++searchGenRef.current;
      setIsLoading(true);
      try {
        const data = await searchUsersByDisplayName(query);
        if (gen !== searchGenRef.current) return;

        // Fetch statuses in parallel with results ready — no separate render pass
        let statuses = {};
        if (data.length > 0) {
          try {
            statuses = await getFriendshipStatuses(data.map((u) => u.id));
          } catch {
            // statuses stay empty; users will just see the add button
          }
        }

        if (gen !== searchGenRef.current) return;

        setFriendStatuses(statuses);
        setResults(data);
        setIsOpen(true);
      } catch {
        if (gen === searchGenRef.current) setResults([]);
      } finally {
        if (gen === searchGenRef.current) setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleNavigate = (displayName) => {
    setIsOpen(false);
    setQuery("");
    dispatch(setTopEdgeCollapsed(true));
    router.push(`/${locale}/${displayName}`);
  };

  const handleAdd = async (addresseeId) => {
    try {
      await sendFriendRequest(addresseeId);
      dispatch(setToast({ msg: "Friend request sent!", type: "success" }));
      // Update local status immediately so the button flips
      setFriendStatuses((prev) => ({ ...prev, [addresseeId]: "pending_sent" }));
      setIsOpen(false);
      setQuery("");
    } catch (err) {
      dispatch(setToast({ msg: err.message, type: "error" }));
    }
  };

  return (
    <div ref={containerRef} className="relative w-64">
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search users…"
      />

      {isOpen && (
        <div className="absolute top-full mt-2 w-full z-50 rounded-2xl border border-teal-500/20 bg-black/90 backdrop-blur-md shadow-2xl overflow-hidden">
          {isLoading ? (
            <p className="secondary px-4 py-3 text-xs text-teal-400/60">
              Searching…
            </p>
          ) : results.length === 0 ? (
            <p className="secondary px-4 py-3 text-xs text-cream/40">
              No users found
            </p>
          ) : (
            <div className="flex flex-col p-1">
              {results.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onAdd={handleAdd}
                  onNavigate={handleNavigate}
                  friendshipStatus={friendStatuses[user.id] ?? "none"}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
