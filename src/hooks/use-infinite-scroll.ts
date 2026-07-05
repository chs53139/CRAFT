"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_PAGE_SIZE = 24;

type UseInfiniteScrollOptions = {
  totalItems: number;
  pageSize?: number;
  resetKey?: string | number;
};

export function useInfiniteScroll({
  totalItems,
  pageSize = DEFAULT_PAGE_SIZE,
  resetKey,
}: UseInfiniteScrollOptions) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [resetKey, pageSize]);

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + pageSize, totalItems));
  }, [pageSize, totalItems]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibleCount >= totalItems) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, totalItems, visibleCount]);

  return {
    visibleCount,
    sentinelRef,
    hasMore: visibleCount < totalItems,
    loadMore,
    reset: () => setVisibleCount(pageSize),
  };
}

export { DEFAULT_PAGE_SIZE };
