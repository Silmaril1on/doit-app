"use client";
import { useCallback } from "react";
import useSWR from "swr";
import { usePagination } from "./usePagination";

const PAGE_SIZE = 20;

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch active quests");
    return res.json();
  });

export const ACTIVE_QUESTS_PAGE1_KEY = `/api/user/task/active-quests?limit=${PAGE_SIZE}&offset=0`;

/**
 * useActiveQuests
 * - initialData: SSR-fetched { quests, total } passed as SWR fallback
 * - revalidateOnFocus / revalidateOnReconnect: live client-side freshness
 * - dedupingInterval: 15 min cache window
 */
export function useActiveQuests(initialData = null) {
  const { data, error, isLoading, mutate } = useSWR(
    ACTIVE_QUESTS_PAGE1_KEY,
    fetcher,
    {
      fallbackData: initialData ?? undefined,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 900000, // 15 min
    },
  );

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
