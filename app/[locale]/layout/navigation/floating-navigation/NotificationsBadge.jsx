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
import useSWR from "swr";

const LIMIT = 5;

const fetcher = (url) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch notifications");
    return r.json();
  });

const NotificationsBadge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id ?? null;

  const { data, mutate } = useSWR(
    userId ? `/api/admin/notifications?limit=${LIMIT}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 120000, // 2 min — notifications are low-urgency for polling
      fallbackData: { notifications: [], hasMore: false },
    },
  );

  const notifications = data?.notifications ?? [];
  const hasMore = data?.hasMore ?? false;
  const hasUnread = notifications.some((n) => !n.has_read);

  // Supabase Realtime — push new notifications into SWR cache without a refetch
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
          if (payload.new.user_id !== userId) return;
          mutate(
            (current) => {
              const prev = current?.notifications ?? [];
              if (prev.some((n) => n.id === payload.new.id)) return current;
              const next = [payload.new, ...prev];
              return {
                notifications: next.slice(0, LIMIT),
                hasMore: next.length > LIMIT || (current?.hasMore ?? false),
              };
            },
            { revalidate: false },
          );
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId, mutate]);

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
      mutate(
        (current) => ({
          ...current,
          notifications: (current?.notifications ?? []).map((n) => ({
            ...n,
            has_read: true,
          })),
        }),
        { revalidate: false },
      );
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
      mutate(
        (current) => ({
          ...current,
          notifications: (current?.notifications ?? []).filter(
            (n) => n.id !== id,
          ),
        }),
        { revalidate: false },
      );
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
            className="absolute bottom-[calc(100%+24px)] -right-18 w-80 z-50 rounded-2xl border border-primary/20 bg-black/80 backdrop-blur-2xl overflow-hidden"
          >
            {/* header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-primary/15">
              <p className="text-sm font-semibold text-cream tracking-wide">
                Notifications
              </p>
              <div className="flex items-center gap-2">
                {hasMore && (
                  <Button
                    size="sm"
                    text="View All"
                    variant="outline"
                    href={`/${locale}/notifications`}
                  />
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
