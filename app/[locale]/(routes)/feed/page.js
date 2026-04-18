import React from "react";
import { getUnifiedFriendsFeed } from "@/app/[locale]/lib/services/tasks/feed/feedService";
import Feed from "./Feed";

const FeedsPage = async () => {
  const { items, total } = await getUnifiedFriendsFeed({
    offset: 0,
    limit: 20,
  }).catch(() => ({ items: [], total: 0 }));
  return <Feed initialItems={items} total={total} />;
};

export default FeedsPage;
