"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";
import { setXp } from "@/app/[locale]/lib/features/xpSlice";
import { useActiveQuests } from "@/app/[locale]/lib/hooks/useActiveQuests";
import { ACHIEVEMENTS_PAGE1_KEY } from "@/app/[locale]/lib/hooks/useAchievements";
import { mutate as globalMutate } from "swr";
import ObjectivePageWrapper from "../(componets)/ObjectivePageWrapper";

const REVALIDATE_MODALS = ["editObjective"];

const ActiveQuests = ({ initialData = null }) => {
  const dispatch = useDispatch();
  const {
    quests: swrQuests,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    mutate,
  } = useActiveQuests(initialData);

  const [quests, setQuests] = useState(swrQuests);
  useEffect(() => {
    setQuests(swrQuests);
  }, [swrQuests]);

  const handleToggleSubtask = useCallback(
    async (quest, subtaskIndex) => {
      const currentSubtasks = Array.isArray(quest?.subtasks)
        ? quest.subtasks
        : [];
      const nextSubtasks = currentSubtasks.map((st, i) =>
        i === subtaskIndex ? { ...st, completed: !st.completed } : st,
      );
      const allDone =
        nextSubtasks.length > 0 &&
        nextSubtasks.every((st) => typeof st === "object" && st.completed);

      setQuests((prev) =>
        prev.map((q) =>
          q.id === quest.id ? { ...q, subtasks: nextSubtasks } : q,
        ),
      );

      try {
        const patchBody = allDone
          ? { subtasks: nextSubtasks, status: "completed" }
          : { subtasks: nextSubtasks };
        const response = await fetch(
          `/api/user/task/active-quests?id=${encodeURIComponent(quest.id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patchBody),
          },
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to update subtask");
        if (allDone) {
          setQuests((prev) => prev.filter((q) => q.id !== quest.id));
          if (data.xpUpdate) dispatch(setXp(data.xpUpdate));
          dispatch(
            setToast({
              type: "success",
              msg: "All subtasks done! Task completed.",
            }),
          );
          mutate();
          globalMutate(ACHIEVEMENTS_PAGE1_KEY);
        }
      } catch (error) {
        setQuests((prev) =>
          prev.map((q) =>
            q.id === quest.id ? { ...q, subtasks: currentSubtasks } : q,
          ),
        );
        dispatch(
          setToast({
            type: "error",
            msg:
              error instanceof Error
                ? error.message
                : "Failed to update subtask",
          }),
        );
      }
    },
    [dispatch, mutate],
  );

  const handleRemoveSubtask = useCallback(
    async (quest, subtaskIndex) => {
      const currentSubtasks = Array.isArray(quest?.subtasks)
        ? quest.subtasks
        : [];
      if (currentSubtasks.length === 0 || subtaskIndex < 0) return;

      const nextSubtasks = currentSubtasks.filter((_, i) => i !== subtaskIndex);
      setQuests((prev) =>
        prev.map((q) =>
          q.id === quest.id ? { ...q, subtasks: nextSubtasks } : q,
        ),
      );

      try {
        const response = await fetch(
          `/api/user/task/active-quests?id=${encodeURIComponent(quest.id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subtasks: nextSubtasks }),
          },
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to update subtasks");
      } catch (error) {
        setQuests((prev) =>
          prev.map((q) =>
            q.id === quest.id ? { ...q, subtasks: currentSubtasks } : q,
          ),
        );
        dispatch(
          setToast({
            type: "error",
            msg:
              error instanceof Error
                ? error.message
                : "Failed to update subtasks",
          }),
        );
      }
    },
    [dispatch],
  );

  const handleCompleteQuest = useCallback(
    async (quest) => {
      const subtasks = Array.isArray(quest?.subtasks) ? quest.subtasks : [];
      const allSubtasksCompleted = subtasks.every(
        (st) => typeof st === "object" && st.completed,
      );

      if (subtasks.length > 0 && !allSubtasksCompleted) {
        dispatch(
          setToast({ type: "error", msg: "Please, complete all the subtasks" }),
        );
        return;
      }

      setQuests((prev) => prev.filter((q) => q.id !== quest.id));
      try {
        const response = await fetch(
          `/api/user/task/active-quests?id=${encodeURIComponent(quest.id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "completed" }),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to complete quest");
        }
        if (data.xpUpdate) dispatch(setXp(data.xpUpdate));
        dispatch(
          setToast({ type: "success", msg: "Task completed! Well done." }),
        );
        mutate();
        globalMutate(ACHIEVEMENTS_PAGE1_KEY);
      } catch (error) {
        mutate();
        dispatch(
          setToast({
            type: "error",
            msg:
              error instanceof Error
                ? error.message
                : "Failed to complete quest",
          }),
        );
      }
    },
    [dispatch, mutate],
  );

  const handleDeleteQuest = useCallback(
    async (quest) => {
      setQuests((prev) => prev.filter((q) => q.id !== quest.id));
      try {
        const response = await fetch(
          `/api/user/task/active-quests?id=${encodeURIComponent(quest.id)}`,
          { method: "DELETE" },
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to delete quest");
        }
        mutate();
      } catch (error) {
        mutate();
        dispatch(
          setToast({
            type: "error",
            msg:
              error instanceof Error ? error.message : "Failed to delete quest",
          }),
        );
      }
    },
    [dispatch, mutate],
  );

  return (
    <ObjectivePageWrapper
      items={quests}
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      loadMore={loadMore}
      title="Active Quests"
      subtitle="Tasks you have started and are currently working on."
      showCreateButton={false}
      emptyMessage="No active quests yet. Start a task from your Objectives to see it here."
      revalidateOnModalClose={REVALIDATE_MODALS}
      onModalClose={mutate}
      onDelete={handleDeleteQuest}
      onComplete={handleCompleteQuest}
      onToggleSubtask={handleToggleSubtask}
      onRemoveSubtask={handleRemoveSubtask}
    />
  );
};

export default ActiveQuests;
