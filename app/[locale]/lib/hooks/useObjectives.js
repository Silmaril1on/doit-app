"use client";
import { useCallback } from "react";
import useSWR from "swr";
import { usePagination } from "./usePagination";

const PAGE_SIZE = 20;

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch objectives");
    return res.json();
  });

export const OBJECTIVES_PAGE1_KEY = `/api/user/task/objectives?status=todo&limit=${PAGE_SIZE}&offset=0`;

/**
 * useObjectives
 * - initialData: SSR-fetched { objectives, total } passed as SWR fallback
 * - revalidateOnFocus / revalidateOnReconnect: live client-side freshness
 * - dedupingInterval: 15 min cache window — no redundant background fetches
 */
export function useObjectives(initialData = null) {
  const { data, error, isLoading, mutate } = useSWR(
    OBJECTIVES_PAGE1_KEY,
    fetcher,
    {
      fallbackData: initialData ?? undefined,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 900000, // 15 min
    },
  );

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
