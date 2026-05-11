"use client";
import { usePathname, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import FloatingNavigation from "./navigation/floating-navigation/FloatingNavigation";
import TopEdgeModal from "../components/modals/TopEdgeModal";
import { selectCurrentUser } from "../lib/features/userSlice";

/**
 * Routes that should show FloatingNavigation + TopEdgeModal.
 *
 * Matching rules (after stripping the locale prefix):
 *  - /feed
 *  - /game-settings  (and all sub-routes)
 *  - /tasks/*
 *  - /<username>     (any single-segment path that is NOT a static known route)
 *  - /admin-dashboard (and sub-routes) — only when user is_admin
 */
const STATIC_ROUTES = new Set([
  "login",
  "register",
  "reset-password",
  "feed",
  "tasks",
  "game-settings",
  "generate-assets",
  "qr",
  "task-manager",
  "admin-dashboard",
  "verify-email",
]);

const APP_SHELL_PREFIXES = [
  "/feed",
  "/game-settings",
  "/tasks",
  "/admin-dashboard",
];

function stripLocale(pathname, locales) {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`))
      return pathname.slice(locale.length + 1);
  }
  return pathname;
}

export default function AppShellWidgets() {
  const pathname = usePathname();
  const params = useParams();
  const user = useSelector(selectCurrentUser);

  const locales = ["en", "de", "ka"];
  const cleanPath = stripLocale(pathname ?? "", locales);

  // Match /feed, /game-settings/*, /tasks/*
  const isAppShellPrefix = APP_SHELL_PREFIXES.some(
    (p) => cleanPath === p || cleanPath.startsWith(`${p}/`),
  );

  // Match /<username> — a single segment that is not a known static route
  const segments = cleanPath.split("/").filter(Boolean);
  const isProfileRoute =
    segments.length === 1 && !STATIC_ROUTES.has(segments[0]);

  const isAdminRoute =
    cleanPath === "/admin-dashboard" ||
    cleanPath.startsWith("/admin-dashboard/");

  // Admin routes only show shell for admins
  const shouldShow =
    isAppShellPrefix ||
    isProfileRoute ||
    (isAdminRoute && Boolean(user?.is_admin));

  if (!shouldShow) return null;

  return (
    <>
      <FloatingNavigation />
      <TopEdgeModal />
    </>
  );
}
