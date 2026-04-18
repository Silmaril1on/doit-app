"use client";
import { usePathname } from "next/navigation";
import Navigation from "./navigation/Navigation";

export default function NavigationWrapper() {
  const pathname = usePathname();

  const isAuthRoute =
    pathname?.endsWith("/login") ||
    pathname?.endsWith("/register") ||
    pathname?.endsWith("/reset-password") ||
    pathname?.endsWith("/reset-password/update-password");

  if (isAuthRoute) {
    return null;
  }

  return (
    <>
      <Navigation />
    </>
  );
}
