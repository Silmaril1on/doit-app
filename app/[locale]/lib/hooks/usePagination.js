"use client";
import { useState, useCallback, useRef } from "react";

export function usePagination({ pageSize = 20 } = {}) {
  const [extraItems, setExtraItems] = useState([]);
  const [nextOffset, setNextOffset] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // useRef guard prevents stale-closure false negatives and avoids adding
  // isLoadingMore to the callback's dependency array (which would recreate
  // loadMore on every load-state change, causing downstream hook churn).
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(
    async (fetchFn) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setIsLoadingMore(true);
      try {
        const { items, total } = await fetchFn(nextOffset, pageSize);
        setExtraItems((prev) => [...prev, ...items]);
        setNextOffset((prev) => prev + items.length);
        return total;
      } finally {
        isLoadingRef.current = false;
        setIsLoadingMore(false);
      }
    },
    [nextOffset, pageSize],
  );

  const reset = useCallback(() => {
    setExtraItems([]);
    setNextOffset(pageSize);
  }, [pageSize]);

  return { extraItems, nextOffset, isLoadingMore, loadMore, reset };
}
