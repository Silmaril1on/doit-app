"use client";
import { useCallback } from "react";
import useSWR from "swr";
import { usePagination } from "./usePagination";

const PAGE_SIZE = 20;

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch achievements");
    return res.json();
  });

export const ACHIEVEMENTS_PAGE1_KEY = `/api/user/task/achievements?limit=${PAGE_SIZE}&offset=0`;

export function useAchievements(initialData = null) {
  const { data, error, isLoading, mutate } = useSWR(
    ACHIEVEMENTS_PAGE1_KEY,
    fetcher,
    {
      fallbackData: initialData ?? undefined,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 900000,
    },
  );

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
