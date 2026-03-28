"use client";
import { useState, useCallback } from "react";

/**
 * Generic load-more pagination hook.
 *
 * @param {object} options
 * @param {number} [options.pageSize=20] - items per page
 *
 * Usage:
 *   const { extraItems, isLoadingMore, loadMore, reset } = usePagination({ pageSize: 20 });
 *   // loadMore takes an async fetchFn(offset, limit) => { items: [], total: number }
 */
export function usePagination({ pageSize = 20 } = {}) {
  const [extraItems, setExtraItems] = useState([]);
  const [nextOffset, setNextOffset] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = useCallback(
    async (fetchFn) => {
      if (isLoadingMore) return;
      setIsLoadingMore(true);
      try {
        const { items, total } = await fetchFn(nextOffset, pageSize);
        setExtraItems((prev) => [...prev, ...items]);
        setNextOffset((prev) => prev + items.length);
        return total;
      } finally {
        setIsLoadingMore(false);
      }
    },
    [isLoadingMore, nextOffset, pageSize],
  );

  const reset = useCallback(() => {
    setExtraItems([]);
    setNextOffset(pageSize);
  }, [pageSize]);

  return { extraItems, nextOffset, isLoadingMore, loadMore, reset };
}