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
    if (!res.ok) throw new Error("Failed to fetch active quests");
    return res.json();
  });

export const ACTIVE_QUESTS_PAGE1_KEY = `/api/user/task/active-quests?limit=${PAGE_SIZE}&offset=0`;

export function useActiveQuests(initialData = null, userIdOverride = null) {
  const userId = userIdOverride ?? getCookieUserId();
  const swrKey = userId ? [ACTIVE_QUESTS_PAGE1_KEY, userId] : null;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    fallbackData: initialData ?? { quests: [], total: 0 },
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  });

  const firstPage = data?.quests ?? [];
  const total = data?.total ?? firstPage.length;

  const {
    extraItems,
    isLoadingMore,
    loadMore: _loadMore,
  } = usePagination({ pageSize: PAGE_SIZE });

  const hasMore = firstPage.length + extraItems.length < total;

  const fetchNextPage = useCallback(
    (off, lim) =>
      fetch(`/api/user/task/active-quests?limit=${lim}&offset=${off}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load more active quests");
          return res.json();
        })
        .then((d) => ({ items: d.quests ?? [], total: d.total ?? 0 })),
    [],
  );

  const loadMore = useCallback(() => {
    if (hasMore) _loadMore(fetchNextPage);
  }, [hasMore, _loadMore, fetchNextPage]);

  return {
    quests: [...firstPage, ...extraItems],
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    mutate,
  };
}
