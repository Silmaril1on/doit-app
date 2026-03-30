"use client";

import Button from "@/app/[locale]/components/buttons/Button";
import ObjectiveCard from "../(componets)/ObjectiveCard";
import TasksHeader from "../(componets)/ObjectivesHeader";
import ObjectivesSideBar from "../(componets)/ObjectivesSideBar";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import { setToast, clearToast } from "@/app/[locale]/lib/features/toastSlice";
import { selectModal } from "@/app/[locale]/lib/features/modalSlice";
import { useModal } from "@/app/[locale]/lib/hooks/useModal";
import { useActiveQuests } from "@/app/[locale]/lib/hooks/useActiveQuests";
import { ACHIEVEMENTS_PAGE1_KEY } from "@/app/[locale]/lib/hooks/useAchievements";
import {
  EMPTY_FILTERS,
  applyObjectivesFilters,
  searchItems,
  OBJECTIVE_SEARCH_FIELDS,
} from "@/app/[locale]/lib/utils/filterConfig";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mutate as globalMutate } from "swr";

const ActiveQuests = ({ initialData = null }) => {
  const dispatch = useDispatch();
  const { open } = useModal();
  const { modalType } = useSelector(selectModal);
  const lastModalTypeRef = useRef(modalType);

  const {
    quests: swrQuests,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    mutate,
  } = useActiveQuests(initialData);

  // Local copy for optimistic updates
  const [quests, setQuests] = useState(swrQuests);
  useEffect(() => {
    setQuests(swrQuests);
  }, [swrQuests]);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Revalidate when the edit modal closes so changes are reflected
  useEffect(() => {
    const wasEditOpen = lastModalTypeRef.current === "editObjective";
    if (wasEditOpen && modalType === null) mutate();
    lastModalTypeRef.current = modalType;
  }, [modalType, mutate]);

  const handleOpenEdit = (quest) => {
    dispatch(clearToast());
    open("editObjective", { objective: quest });
  };

  const handleFiltersApply = (allFilters) => setFilters(allFilters);

  const handleToggleSubtask = useCallback(
    async (quest, subtaskIndex) => {
      const currentSubtasks = Array.isArray(quest?.subtasks)
        ? quest.subtasks
        : [];
      const nextSubtasks = currentSubtasks.map((st, i) =>
        i === subtaskIndex ? { ...st, completed: !st.completed } : st,
      );

      // Auto-complete when all subtasks are ticked
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
          dispatch(
            setToast({
              type: "success",
              msg: "All subtasks done! Task completed.",
            }),
          );
          mutate(); // revalidate active quests
          globalMutate(ACHIEVEMENTS_PAGE1_KEY); // revalidate achievements
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
      const hasSubtasks = subtasks.length > 0;
      const allSubtasksCompleted = subtasks.every(
        (st) => typeof st === "object" && st.completed,
      );

      if (hasSubtasks && !allSubtasksCompleted) {
        dispatch(
          setToast({
            type: "error",
            msg: "Please, complete all the subtasks",
          }),
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
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to complete quest");
        }
        dispatch(
          setToast({ type: "success", msg: "Task completed! Well done." }),
        );
        mutate(); // revalidate active quests
        globalMutate(ACHIEVEMENTS_PAGE1_KEY); // revalidate achievements
      } catch (error) {
        mutate(); // rollback
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
        mutate(); // rollback via server revalidation
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

  const searched = searchItems(
    quests,
    searchQuery,
    OBJECTIVE_SEARCH_FIELDS,
  );
  const filteredQuests = applyObjectivesFilters(searched, filters);

  return (
    <section className="w-full grow p-4 lg:p-8 flex flex-col gap-3">
      <TasksHeader
        items={quests}
        title="Active Quests"
        subtitle="Tasks you have started and are currently working on."
        showCreateButton={false}
        showControls={true}
        onOpenSidebar={() => setSidebarOpen(true)}
        filters={filters}
        onClearFilters={() => setFilters(EMPTY_FILTERS)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ObjectivesSideBar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        objectives={quests}
        filters={filters}
        onFiltersApply={handleFiltersApply}
      />

      {isLoading ? (
        <p className="secondary text-sm text-chino/70">
          Loading active quests...
        </p>
      ) : null}

      {!isLoading && quests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-teal-500/25 bg-black/35 p-6 text-center">
          <p className="secondary text-sm text-chino/80">
            No active quests yet. Start a task from your Objectives to see it
            here.
          </p>
        </div>
      ) : null}

      {!isLoading &&
      quests.length > 0 &&
      filteredQuests.length === 0 ? (
        <ItemCard className="p-6 text-center">
          <p className="secondary text-sm text-chino/80">
            No quests match the current filters.
          </p>
        </ItemCard>
      ) : null}

      {!isLoading && filteredQuests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredQuests.map((quest) => (
            <ObjectiveCard
              key={quest.id}
              objective={quest}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteQuest}
              onRemoveSubtask={handleRemoveSubtask}
              onToggleSubtask={handleToggleSubtask}
              onComplete={handleCompleteQuest}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && hasMore ? (
        <div className="flex justify-center pt-2">
          <Button
            text={isLoadingMore ? "Loading..." : "Load More"}
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
          />
        </div>
      ) : null}
    </section>
  );
};

export default ActiveQuests;
