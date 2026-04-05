"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";
import { useAchievements } from "@/app/[locale]/lib/hooks/useAchievements";
import { ACTIVE_QUESTS_PAGE1_KEY } from "@/app/[locale]/lib/hooks/useActiveQuests";
import { mutate as globalMutate } from "swr";
import ObjectivePageWrapper from "../(componets)/ObjectivePageWrapper";

const REVALIDATE_MODALS = ["editObjective", "uploadGallery"];

const Achievements = ({ initialData = null }) => {
  const dispatch = useDispatch();
  const {
    achievements: swrAchievements,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    mutate,
  } = useAchievements(initialData);

  const [achievements, setAchievements] = useState(swrAchievements);
  useEffect(() => {
    setAchievements(swrAchievements);
  }, [swrAchievements]);

  // Reactivate: move a completed achievement back to Active Quests
  const handleReactivate = useCallback(
    async (achievement) => {
      setAchievements((prev) => prev.filter((a) => a.id !== achievement.id));
      try {
        const response = await fetch(
          `/api/user/task/achievements?id=${encodeURIComponent(achievement.id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "in_progress" }),
          },
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to reactivate task");
        }
        dispatch(
          setToast({ type: "success", msg: "Task moved to Active Quests" }),
        );
        mutate();
        globalMutate(ACTIVE_QUESTS_PAGE1_KEY);
      } catch (error) {
        mutate();
        dispatch(
          setToast({
            type: "error",
            msg:
              error instanceof Error
                ? error.message
                : "Failed to reactivate task",
          }),
        );
      }
    },
    [dispatch, mutate],
  );

  const handleModalClose = useCallback(() => {
    mutate();
    globalMutate(ACTIVE_QUESTS_PAGE1_KEY);
  }, [mutate]);

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
      revalidateOnModalClose={REVALIDATE_MODALS}
      onModalClose={handleModalClose}
      completedView={true}
    />
  );
};

export default Achievements;
