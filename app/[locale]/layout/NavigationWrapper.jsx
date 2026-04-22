"use client";
import { usePathname } from "next/navigation";
import Navigation from "./navigation/Navigation";

export default function NavigationWrapper() {
  const pathname = usePathname();
  const segments = (pathname ?? "").split("/").filter(Boolean);
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

  const isUserProfileRoute =
    (segments.length === 2 && !staticRoutes.has(segments[1])) ||
    (segments.length === 1 && !staticRoutes.has(segments[0]));

  if (isAuthRoute || isUserProfileRoute) {
    return null;
  }

  return (
    <>
      <Navigation />
    </>
  );
}
