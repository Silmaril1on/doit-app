"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { FaUserFriends, FaHouseDamage } from "react-icons/fa";
import { RiArrowUpWideFill } from "react-icons/ri";
import { motion } from "framer-motion";
import useSWR from "swr";

import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import {
  selectTopEdgeCollapsed,
  setTopEdgeCollapsed,
} from "@/app/[locale]/lib/features/topEdgeSlice";
import FriendShipContainer from "../container/FriendShipContainer";
import IconTag from "../elements/IconTag";

const FOOTER_H = 56;

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
};

const swrOptions = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 60000,
  focusThrottleInterval: 60000,
  keepPreviousData: true,
};

const TopEdgeModal = () => {
  const pathname = usePathname();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : null;
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);
  const collapsed = useSelector(selectTopEdgeCollapsed);

  const [activeView, setActiveView] = useState("friends");
  const containerRef = useRef(null);

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
    normalizedPath.endsWith("/reset-password/update-password");

  // Close when user clicks outside the panel (only while expanded)
  useEffect(() => {
    if (collapsed) return;

    const handlePointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        dispatch(setTopEdgeCollapsed(true));
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [collapsed, dispatch]);

  if (!user || isHomeRoute || isHiddenRoute) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ y: "-100%" }}
      animate={{
        y: collapsed ? `calc(-85vh + ${FOOTER_H}px)` : "0%",
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 18,
      }}
      className="w-full z-50 bg-teal-950/30 backdrop-blur-sm flex flex-col fixed overflow-hidden rounded-b-3xl"
      style={{ height: "85vh" }}
    >
      {activeView === "friends" && (
        <FriendShipContainer
          onUserNavigate={() => dispatch(setTopEdgeCollapsed(true))}
        />
      )}

      {activeView === "tasks" && <TasksList />}

      <div
        className="flex items-center justify-between px-12 shrink-0"
        style={{ height: FOOTER_H }}
      >
        <div
          onClick={() => setActiveView("friends")}
          className="cursor-pointer relative z-3 text-2xl"
        >
          <IconTag icon={<FaUserFriends />} />
        </div>
        <div
          style={{
            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
          }}
          onClick={() => dispatch(setTopEdgeCollapsed(!collapsed))}
          className="cursor-pointer relative z-3 text-2xl"
        >
          <IconTag icon={<RiArrowUpWideFill />} />
        </div>
        <div
          onClick={() => setActiveView("tasks")}
          className="cursor-pointer relative z-3 text-2xl"
        >
          <IconTag icon={<FaHouseDamage />} />
        </div>
      </div>
    </motion.div>
  );
};

const TasksList = () => {
  return (
    <div className="h-full relative text-teal-500 text-2xl flex items-center justify-center bg-[#031c1a] w-full rounded-bl-3xl shadow-[2px_0_10px_2px_rgba(0,0,0,1)]">
      <div className="absolute z-0 -bottom-14 right-0 bg-[#031c1a] inverted-left" />
      hello tasks list
    </div>
  );
};

export default TopEdgeModal;
