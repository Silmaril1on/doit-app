"use client";
import { useEffect, useRef, useState } from "react";
import { IoIosNotifications } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/app/[locale]/lib/supabase/supabaseClient";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import ActionButton from "../../../components/buttons/ActionButton";
import Button from "../../../components/buttons/Button";
import Link from "next/link";
import Motion from "../../../components/motion/Motion";

const LIMIT = 5;

const NotificationsBadge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const containerRef = useRef(null);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id ?? null;

  const hasUnread = notifications.some((n) => !n.has_read);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/notifications?limit=${LIMIT}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) {
          setNotifications(data.notifications ?? []);
          setHasMore(data.hasMore ?? false);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Supabase Realtime — listen for new notifications inserted for this user
  useEffect(() => {
    if (!userId) return;
    const channel = supabaseClient
      .channel(`notifications-user-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          // Filter client-side — server-side row filter requires REPLICA IDENTITY FULL
          if (payload.new.user_id !== userId) return;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === payload.new.id)) return prev;
            const next = [payload.new, ...prev];
            if (next.length > LIMIT) setHasMore(true);
            return next.slice(0, LIMIT);
          });
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId]);

  // Close panel on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const handleReadAll = async () => {
    try {
      const res = await fetch("/api/admin/notifications", { method: "PATCH" });
      if (!res.ok) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, has_read: true })));
    } catch {
      // silently ignore
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `/api/admin/notifications?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      if (!res.ok) return;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // silently ignore
    }
  };

  return (
    <div ref={containerRef} className="relative ">
      {/* Trigger button */}
      <div className="relative">
        <ActionButton
          icon={<IoIosNotifications size={16} />}
          onClick={() => setIsOpen((prev) => !prev)}
          ariaLabel="Toggle notifications"
        />
        {hasUnread && (
          <span className="pointer-events-none absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[crimson] animate-pulse" />
        )}
      </div>

      {/* Notifications panel — bottom edge anchored just above the nav bar */}
      <AnimatePresence>
        {isOpen && (
          <Motion
            animation="right"
            className="absolute bottom-[calc(100%+15px)] -right-20 w-80 z-50 rounded-2xl border border-teal-500/20 bg-black/80 backdrop-blur-2xl overflow-hidden"
          >
            {/* header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-teal-500/15">
              <p className="text-sm font-semibold text-cream tracking-wide">
                Notifications
              </p>
              <div className="flex items-center gap-2">
                {hasMore && (
                  <Link
                    href={`/${locale}/notifications`}
                    onClick={() => setIsOpen(false)}
                    className="secondary text-xs text-teal-400 border border-teal-500/30 rounded px-2 py-0.5 hover:bg-teal-500/10 duration-200"
                  >
                    View All
                  </Link>
                )}
                {hasUnread && (
                  <Button
                    text="Read All"
                    variant="outline"
                    onClick={handleReadAll}
                    className="text-xs px-2 py-0.5"
                  />
                )}
              </div>
            </div>
            {/* Content — capped to 5 items height */}
            <ul>
              {notifications.length === 0 && (
                <li className="px-4 py-6 text-center">
                  <p className="secondary text-xs text-chino/60">
                    No notifications yet.
                  </p>
                </li>
              )}
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`group flex items-start gap-3 px-4 pointer-events-none py-3 m-1 rounded-lg duration-200 ${
                    n.has_read ? "opacity-50" : "bg-teal-500/5"
                  }`}
                >
                  <span
                    className={`shrink-0 h-2 w-2 rounded-full ${
                      n.has_read ? "bg-green-500" : "bg-[crimson]"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-cream">
                      {n.status}
                    </p>
                    <p className="secondary text-xs text-chino/75">
                      {n.message}
                    </p>
                    <p className="secondary text-[10px] text-chino/40">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    aria-label="Delete notification"
                    className="shrink-0 mt-0.5 cursor-pointer text-red-500/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <IoMdClose size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </Motion>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsBadge;
