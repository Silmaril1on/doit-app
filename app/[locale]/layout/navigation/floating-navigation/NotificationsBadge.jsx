"use client";

import React, { useEffect, useRef, useState } from "react";
import { IoIosNotifications } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import ActionButton from "../../../components/buttons/ActionButton";
import Button from "../../../components/buttons/Button";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import Motion from "../../../components/motion/Motion";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { supabaseClient } from "@/app/[locale]/lib/supabase/supabaseClient";

const LIMIT = 5;

const NotificationsBadge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const containerRef = useRef(null);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const user = useSelector(selectCurrentUser);

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
    if (!user?.id) return;

    const channel = supabaseClient
      .channel(`notifications-user-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, LIMIT));
          setHasMore((prev) => prev); // preserve existing hasMore
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [user?.id]);

  // Auto mark-all-read when the panel is closed after being opened
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      // Panel just closed — silently mark all as read
      fetch("/api/admin/notifications", { method: "PATCH" }).catch(() => {});
      setNotifications((prev) => prev.map((n) => ({ ...n, has_read: true })));
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

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
