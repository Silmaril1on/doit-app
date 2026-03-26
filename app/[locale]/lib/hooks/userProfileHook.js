import useSWR from "swr";

const fetcher = (url) =>
  fetch(url, { cache: "no-store" }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
  });

/**
 * useUserProfile
 * - initialData: raw user object from SSR (passed as fallback)
 * - Hits /api/user/profile/single-profile for client-side freshness
 * - dedupingInterval: 30 min — no duplicate background requests within that window
 * - revalidateOnFocus / revalidateOnReconnect — live revalidation on user activity
 */
export function useUserProfile(initialData = null) {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/user/profile/single-profile",
    fetcher,
    {
      fallbackData: initialData ? { profile: initialData } : undefined,
      revalidateOnMount: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0, // always re-fetch after mutate()
    },
  );

  return {
    profile: data?.profile ?? null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * useAllUsers
 * - Fetches all users (admin use)
 * - 30 min dedup window
 */
export function useAllUsers() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/user/profile",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1800000, // 30 minutes
    },
  );

  return {
    users: data?.users ?? [],
    isLoading,
    error,
    mutate,
  };
}
