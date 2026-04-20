"use client";
import { useCallback } from "react";
import useSWR from "swr";
import { usePagination } from "./usePagination";

const PAGE_SIZE = 20;

// Read the non-httpOnly user-id cookie synchronously so the SWR key is
// user-specific from the very first render, preventing cross-user cache leakage.
const getCookieUserId = () => {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith("doit-user-id="));
  return entry ? decodeURIComponent(entry.split("=").slice(1).join("=")) : null;
};

const fetcher = ([url]) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch objectives");
    return res.json();
  });

export const OBJECTIVES_PAGE1_KEY = `/api/user/task/objectives?status=todo&limit=${PAGE_SIZE}&offset=0`;

export function useObjectives(initialData = null, userIdOverride = null) {
  const userId = userIdOverride ?? getCookieUserId();
  const swrKey = userId ? [OBJECTIVES_PAGE1_KEY, userId] : null;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    fallbackData: initialData ?? { objectives: [], total: 0 },
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    dedupingInterval: 30000, // 30 sec
  });

  const firstPage = data?.objectives ?? [];
  const total = data?.total ?? firstPage.length;

  const {
    extraItems,
    isLoadingMore,
    loadMore: _loadMore,
    reset,
  } = usePagination({ pageSize: PAGE_SIZE });

  const hasMore = firstPage.length + extraItems.length < total;

  const fetchNextPage = useCallback(
    (off, lim) =>
      fetch(`/api/user/task/objectives?status=todo&limit=${lim}&offset=${off}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load more objectives");
          return res.json();
        })
        .then((d) => ({ items: d.objectives ?? [], total: d.total ?? 0 })),
    [],
  );

  const loadMore = useCallback(() => {
    if (hasMore) _loadMore(fetchNextPage);
  }, [hasMore, _loadMore, fetchNextPage]);

  return {
    objectives: [...firstPage, ...extraItems],
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    mutate,
    reset,
  };
}
