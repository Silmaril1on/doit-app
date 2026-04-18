"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { useObjectives } from "@/app/[locale]/lib/hooks/useObjectives";
import { ACTIVE_QUESTS_PAGE1_KEY } from "@/app/[locale]/lib/hooks/useActiveQuests";
import { mutate as globalMutate } from "swr";
import ObjectivePageWrapper from "../(componets)/ObjectivePageWrapper";

const REVALIDATE_MODALS = ["createObjective", "editObjective"];

const Objectives = ({ initialData = null }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id ?? null;
  const {
    objectives: swrObjectives,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    mutate,
  } = useObjectives(initialData);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Initialize from the serialized server prop so server and client agree on the
  // first render. After mount, the useEffect below keeps it in sync with SWR.
  const [objectives, setObjectives] = useState(
    () => initialData?.objectives ?? [],
  );
  useEffect(() => {
    setObjectives(swrObjectives);
  }, [swrObjectives]);

  const handleStartTask = useCallback(
    async (objective) => {
      setObjectives((prev) => prev.filter((o) => o.id !== objective.id));
      try {
        const response = await fetch(
          `/api/user/task/objectives?id=${encodeURIComponent(objective.id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "in_progress" }),
          },
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to start task");
        }
        dispatch(
          setToast({ type: "success", msg: "You have started your task" }),
        );
        mutate();
        globalMutate([ACTIVE_QUESTS_PAGE1_KEY, userId]);
      } catch (error) {
        mutate();
        dispatch(
          setToast({
            type: "error",
            msg:
              error instanceof Error ? error.message : "Failed to start task",
          }),
        );
      }
    },
    [dispatch, mutate, userId],
  );

  const handleDeleteTask = useCallback(
    async (objective) => {
      setObjectives((prev) => prev.filter((o) => o.id !== objective.id));
      try {
        const response = await fetch(
          `/api/user/task/objectives?id=${encodeURIComponent(objective.id)}`,
          { method: "DELETE" },
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to delete task");
        }
        mutate();
      } catch (error) {
        mutate();
        dispatch(
          setToast({
            type: "error",
            msg:
              error instanceof Error ? error.message : "Failed to delete task",
          }),
        );
      }
    },
    [dispatch, mutate],
  );

  const handleRemoveSubtask = useCallback(
    async (objective, subtaskIndex) => {
      const currentSubtasks = Array.isArray(objective?.subtasks)
        ? objective.subtasks
        : [];
      if (currentSubtasks.length === 0 || subtaskIndex < 0) return;

      const nextSubtasks = currentSubtasks.filter((_, i) => i !== subtaskIndex);
      setObjectives((prev) =>
        prev.map((item) =>
          item.id === objective.id ? { ...item, subtasks: nextSubtasks } : item,
        ),
      );

      try {
        const response = await fetch(
          `/api/user/task/objectives?id=${encodeURIComponent(objective.id)}`,
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
        setObjectives((prev) =>
          prev.map((item) =>
            item.id === objective.id
              ? { ...item, subtasks: currentSubtasks }
              : item,
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

  return (
    <ObjectivePageWrapper
      items={objectives}
      hasMore={hasMore}
      isLoading={mounted && isLoading}
      isLoadingMore={isLoadingMore}
      loadMore={loadMore}
      title="Objectives"
      subtitle="Build clear goals, track progress, and keep momentum."
      showCreateButton={true}
      emptyMessage="No objectives yet. Create your first objective to get started."
      revalidateOnModalClose={REVALIDATE_MODALS}
      onModalClose={mutate}
      onDelete={handleDeleteTask}
      onStart={handleStartTask}
      onRemoveSubtask={handleRemoveSubtask}
    />
  );
};

export default Objectives;
