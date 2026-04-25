"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import SearchBar from "./SearchBar";
import ActionButton from "../buttons/ActionButton";
import AppImage from "../elements/ImageTag";
import { searchUsersByDisplayName } from "@/app/[locale]/lib/services/user/userProfiles";
import { sendFriendRequest } from "@/app/[locale]/lib/services/user/friendships";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";
import { setTopEdgeCollapsed } from "@/app/[locale]/lib/features/topEdgeSlice";

const UserCard = ({ user, onAdd, onNavigate }) => {
  const initials = [user.first_name, user.last_name]
    .filter(Boolean)
    .map((n) => n[0])
    .join("");

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
      </div>

      {/* Add button */}
      <ActionButton
        variant="add"
        ariaLabel="Send friend request"
        onClick={(e) => {
          e.stopPropagation();
          onAdd(user.id);
        }}
      />
    </div>
  );
};

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
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
      setIsLoading(true);
      try {
        const data = await searchUsersByDisplayName(query);
        setResults(data);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
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
