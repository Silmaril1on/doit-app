"use client";
import useSWR from "swr";

export const ADMIN_CATEGORIES_KEY = "/api/admin/task-categories";
export const ADMIN_TIERS_KEY = "/api/admin/category-tiers";

const fetcher = (url) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Request failed");
    return r.json();
  });

/**
 * SWR hook for admin task categories.
 * initialData comes from the SSR page and seeds the cache immediately —
 * no loading state on first render.
 */
export function useAdminCategories(initialData = []) {
  const { data, mutate, isLoading } = useSWR(ADMIN_CATEGORIES_KEY, fetcher, {
    fallbackData: { categories: initialData },
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  return { categories: data?.categories ?? [], mutate, isLoading };
}

/**
 * SWR hook for admin achievement tiers.
 * initialData comes from the SSR page and seeds the cache immediately.
 */
export function useAdminTiers(initialData = []) {
  const { data, mutate, isLoading } = useSWR(ADMIN_TIERS_KEY, fetcher, {
    fallbackData: { tiers: initialData },
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  return { tiers: data?.tiers ?? [], mutate, isLoading };
}
