"use client";
import React, { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { FaUserFriends, FaHouseDamage } from "react-icons/fa";
import { RiArrowUpWideFill } from "react-icons/ri";
import useSWR from "swr";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import FriendShipContainer from "../container/FriendShipContainer";

const FOOTER_H = 56;

const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to load data");
  return response.json();
};

const swrOptions = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 30000,
  focusThrottleInterval: 30000,
  keepPreviousData: true,
  refreshInterval: 15000,
};

const TopEdgeModal = () => {
  const pathname = usePathname();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : null;
  const user = useSelector(selectCurrentUser);
  const [activeView, setActiveView] = useState("friends");
  const [collapsed, setCollapsed] = useState(true);
  const requestsSWR = useSWR(
    user ? "/api/add-friend" : null,
    fetcher,
    swrOptions,
  );
  const requestsCount = requestsSWR.data?.requests?.length ?? 0;
  const hasRequests = requestsCount > 0;

  const normalizedPath = (pathname ?? "").replace(/\/$/, "");
  const homePath = locale ? `/${locale}` : "";
  const isHomeRoute =
    !normalizedPath || normalizedPath === "/" || normalizedPath === homePath;
  const isHiddenRoute =
    normalizedPath.endsWith("/login") ||
    normalizedPath.endsWith("/register") ||
    normalizedPath.endsWith("/reset-password") ||
    normalizedPath.endsWith("/feed") ||
    normalizedPath.endsWith("/reset-password/update-password");

  if (!user || isHomeRoute || isHiddenRoute) return null;

  return (
    <div
      className={`w-full z-50 bg-teal-950/30 backdrop-blur-sm flex flex-col fixed overflow-hidden rounded-b-3xl transition-transform duration-500 ease-in-out `}
      style={{
        height: "85vh",
        transform: collapsed
          ? `translateY(calc(-85vh + ${FOOTER_H}px))`
          : "translateY(0)",
      }}
    >
      {activeView === "friends" && (
        <FriendShipContainer onUserNavigate={() => setCollapsed(true)} />
      )}
      {activeView === "tasks" && <TasksList />}
      <div
        className="flex items-center justify-between px-12 shrink-0"
        style={{ height: FOOTER_H }}
      >
        <button
          type="button"
          onClick={() => setActiveView("friends")}
          className="relative z-3"
          aria-label="Friends"
        >
          <FaUserFriends
            className={`cursor-pointer text-2xl transition-colors duration-200 ${
              activeView === "friends" ? "text-teal-400" : "text-teal-600"
            }`}
          />
          {hasRequests && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
          )}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="cursor-pointer text-teal-500 hover:text-teal-300 text-3xl transition-transform duration-500"
          style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <RiArrowUpWideFill />
        </button>

        <FaHouseDamage
          className={`cursor-pointer relative z-3 text-2xl transition-colors duration-200 ${
            activeView === "tasks" ? "text-teal-400" : "text-teal-600"
          }`}
          onClick={() => setActiveView("tasks")}
        />
      </div>
    </div>
  );
};

// ─── Tasks List ──────────────────────────────────────────────────────────────

const TasksList = () => {
  return (
    <div className="h-full relative text-teal-500 text-2xl flex items-center justify-center bg-[#031c1a] w-full rounded-bl-3xl shadow-[2px_0_10px_2px_rgba(0,0,0,1)]">
      <div className="absolute z-0 -bottom-14 right-0 bg-[#031c1a] inverted-left" />
      hello tasks list
    </div>
  );
};

export default TopEdgeModal;
