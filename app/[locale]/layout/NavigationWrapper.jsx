"use client";
import { usePathname } from "next/navigation";
import Navigation from "./navigation/Navigation";

const LOCALES = new Set(["en", "de", "ka"]);

export default function NavigationWrapper() {
  const pathname = usePathname();
  const segments = (pathname ?? "").split("/").filter(Boolean);

  // Strip leading locale segment so checks work for both /en/login and /login
  const effectiveSegments = LOCALES.has(segments[0])
    ? segments.slice(1)
    : segments;

  const staticRoutes = new Set([
    "login",
    "register",
    "reset-password",
    "feed",
    "tasks",
    "game-settings",
    "generate-assets",
    "qr",
    "task-manager",
  ]);

  const isAuthRoute =
    pathname?.endsWith("/login") ||
    pathname?.endsWith("/register") ||
    pathname?.endsWith("/reset-password") ||
    pathname?.endsWith("/feed") ||
    pathname?.endsWith("/tasks/objectives") ||
    pathname?.endsWith("/tasks/active-quests") ||
    pathname?.endsWith("/tasks/achievements") ||
    pathname?.endsWith("/reset-password/update-password");

  // A user-profile route is a single non-static segment (e.g. /john or /en/john)
  const isUserProfileRoute =
    effectiveSegments.length === 1 && !staticRoutes.has(effectiveSegments[0]);

  if (isAuthRoute || isUserProfileRoute) {
    return null;
  }

  return <Navigation />;
}
