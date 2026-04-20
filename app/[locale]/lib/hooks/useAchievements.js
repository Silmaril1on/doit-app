"use client";
import { useCallback } from "react";
import useSWR from "swr";
import { usePagination } from "./usePagination";

const PAGE_SIZE = 20;

const getCookieUserId = () => {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith("doit-user-id="));
  return entry ? decodeURIComponent(entry.split("=").slice(1).join("=")) : null;
};

const fetcher = ([url]) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch achievements");
    return res.json();
  });

export const ACHIEVEMENTS_PAGE1_KEY = `/api/user/task/achievements?limit=${PAGE_SIZE}&offset=0`;

export function useAchievements(initialData = null, userIdOverride = null) {
  const userId = userIdOverride ?? getCookieUserId();
  const swrKey = userId ? [ACHIEVEMENTS_PAGE1_KEY, userId] : null;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    fallbackData: initialData ?? { achievements: [], total: 0 },
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    dedupingInterval: 30000, // 30 sec
  });

  const firstPage = data?.achievements ?? [];
  const total = data?.total ?? firstPage.length;

  const {
    extraItems,
    isLoadingMore,
    loadMore: _loadMore,
  } = usePagination({ pageSize: PAGE_SIZE });

  const hasMore = firstPage.length + extraItems.length < total;

  const fetchNextPage = useCallback(
    (off, lim) =>
      fetch(`/api/user/task/achievements?limit=${lim}&offset=${off}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load more achievements");
          return res.json();
        })
        .then((d) => ({ items: d.achievements ?? [], total: d.total ?? 0 })),
    [],
  );

  const loadMore = useCallback(() => {
    if (hasMore) _loadMore(fetchNextPage);
  }, [hasMore, _loadMore, fetchNextPage]);

  return {
    achievements: [...firstPage, ...extraItems],
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    mutate,
  };
}
