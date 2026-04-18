"use client";
import React, { useCallback } from "react";
import { usePagination } from "@/app/[locale]/lib/hooks/usePagination";
import { getUnifiedFriendsFeed } from "@/app/[locale]/lib/services/tasks/feed/feedService";
import ObjectiveCard from "@/app/[locale]/(routes)/(tasks)/tasks/(componets)/ObjectiveCard";
import LevelUpCard from "./LevelUpCard";
import BadgeCard from "./BadgeCard";
import FriendshipCard from "./FriendshipCard";
import Button from "@/app/[locale]/components/buttons/Button";
import ItemCard from "@/app/[locale]/components/container/ItemCard";

const PAGE_SIZE = 20;

const FeedItem = ({ item }) => {
  switch (item._type) {
    case "levelup":
      return <LevelUpCard item={item} />;
    case "badge":
      return <BadgeCard item={item} />;
    case "friendship":
      return <FriendshipCard item={item} />;
    case "task":
    default:
      return <ObjectiveCard objective={item} readOnly />;
  }
};

const Feed = ({ initialItems = [], total = 0 }) => {
  const {
    extraItems,
    isLoadingMore,
    loadMore: _loadMore,
  } = usePagination({ pageSize: PAGE_SIZE });

  const allItems = [...initialItems, ...extraItems];
  const hasMore = allItems.length < total;

  const fetchNextPage = useCallback(
    (off, lim) => getUnifiedFriendsFeed({ offset: off, limit: lim }),
    [],
  );

  const loadMore = useCallback(() => {
    if (hasMore) _loadMore(fetchNextPage);
  }, [hasMore, _loadMore, fetchNextPage]);

  return (
    <section className="w-full grow px-3 pb-28 flex flex-col gap-3 bg-black">
      <div className="pt-4 px-1">
        <h1 className="text-lg font-bold text-cream">Friends Feed</h1>
        <p className="text-xs secondary text-chino/60">
          See what your friends are up to.
        </p>
      </div>

      {allItems.length === 0 && (
        <ItemCard className="p-6 text-center">
          <p className="secondary text-sm text-chino/80">
            Nothing in your feed yet — add some friends to get started.
          </p>
        </ItemCard>
      )}

      {allItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {allItems.map((item) => (
            <FeedItem key={item.id} item={item} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-6 py-2 text-sm"
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </section>
  );
};

export default Feed;
