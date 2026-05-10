"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { useAchievements } from "@/app/[locale]/lib/hooks/useAchievements";
import { ACTIVE_QUESTS_PAGE1_KEY } from "@/app/[locale]/lib/hooks/useActiveQuests";
import { mutate as globalMutate } from "swr";
import { MdOutlineLocalActivity } from "react-icons/md";
import ObjectivePageWrapper from "../(componets)/ObjectivePageWrapper";

const REVALIDATE_MODALS = ["editObjective", "uploadGallery"];

const Achievements = ({ initialData = null, userId: userIdProp = null }) => {
  const currentUser = useSelector(selectCurrentUser);
  const userId = userIdProp ?? currentUser?.id ?? null;
  const {
    achievements: swrAchievements,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    mutate,
  } = useAchievements(initialData, userIdProp);

  const [achievements, setAchievements] = useState(swrAchievements);
  useEffect(() => {
    setAchievements(swrAchievements);
  }, [swrAchievements]);

  const handleModalClose = useCallback(() => {
    mutate();
    globalMutate([ACTIVE_QUESTS_PAGE1_KEY, userId]);
  }, [mutate, userId]);

  return (
    <ObjectivePageWrapper
      items={achievements}
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      loadMore={loadMore}
      title="Achievements"
      subtitle="Completed tasks that you have already finished."
      showCreateButton={false}
      emptyMessage="No achievements yet. Complete a task in Active Quests to see it here."
      emptyTitle="No Achievements for now"
      emptyIcon={MdOutlineLocalActivity}
      revalidateOnModalClose={REVALIDATE_MODALS}
      onModalClose={handleModalClose}
      completedView={true}
    />
  );
};

export default Achievements;
