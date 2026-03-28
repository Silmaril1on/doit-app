"use client";

import TasksHeader from "../(componets)/ObjectivesHeader";
import ObjectivesSideBar from "../(componets)/ObjectivesSideBar";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";
import { useModal } from "@/app/[locale]/lib/hooks/useModal";
import { selectModal } from "@/app/[locale]/lib/features/modalSlice";
import ObjectiveCard from "../(componets)/ObjectiveCard";
import {
  EMPTY_FILTERS,
  applyObjectivesFilters,
  searchItems,
  OBJECTIVE_SEARCH_FIELDS,
} from "@/app/[locale]/lib/utils/filterConfig";
import { useObjectives } from "@/app/[locale]/lib/hooks/useObjectives";
import { ACTIVE_QUESTS_PAGE1_KEY } from "@/app/[locale]/lib/hooks/useActiveQuests";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mutate as globalMutate } from "swr";

const Objectives = ({ initialData = null }) => {
  const dispatch = useDispatch();
  const { open } = useModal();
  const { modalType } = useSelector(selectModal);
  const lastModalTypeRef = useRef(modalType);

  const {
    objectives: swrObjectives,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    mutate,
  } = useObjectives(initialData);

  // Local copy for optimistic updates — stays in sync when SWR revalidates
  const [objectives, setObjectives] = useState(swrObjectives);
  useEffect(() => {
    setObjectives(swrObjectives);
  }, [swrObjectives]);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Revalidate when an objective modal closes
  useEffect(() => {
    const wasOpen = ["createObjective", "editObjective"].includes(
      lastModalTypeRef.current,
    );
    if (wasOpen && modalType === null) mutate();
    lastModalTypeRef.current = modalType;
  }, [modalType, mutate]);

  const handleOpenCreate = () => {
    dispatch(clearToast());
    open("createObjective");
  };

  const handleOpenEdit = (objective) => {
    dispatch(clearToast());
    open("editObjective", { objective });
  };

  const handleFiltersApply = (allFilters) => setFilters(allFilters);

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
          setToast({
            type: "success",
            msg: "You have started your task",
          }),
        );
        mutate(); // invalidate objectives SWR cache
        globalMutate(ACTIVE_QUESTS_PAGE1_KEY); // immediately populate active-quests cache
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
    [dispatch, mutate],
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
        mutate(); // invalidate SWR cache
      } catch (error) {
        mutate(); // rollback via server revalidation
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

  const handleRemoveSubtask = async (objective, subtaskIndex) => {
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
  };

  const searched = searchItems(
    objectives,
    searchQuery,
    OBJECTIVE_SEARCH_FIELDS,
  );
  const filteredObjectives = applyObjectivesFilters(searched, filters);
  const buttonLabel =
    objectives.length > 0 ? "Create Objective" : "Create First Objective";

  return (
    <section className="w-full grow p-4 lg:p-8 flex flex-col gap-3">
      <TasksHeader
        objectives={objectives}
        buttonLabel={buttonLabel}
        onCreateClick={handleOpenCreate}
        onOpenSidebar={() => setSidebarOpen(true)}
        filters={filters}
        onClearFilters={() => setFilters(EMPTY_FILTERS)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ObjectivesSideBar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        objectives={objectives}
        filters={filters}
        onFiltersApply={handleFiltersApply}
      />

      {isLoading ? (
        <p className="secondary text-sm text-chino/70">Loading objectives...</p>
      ) : null}

      {!isLoading && objectives.length === 0 ? (
        <div className="rounded-xl border border-dashed border-teal-500/25 bg-black/35 p-6 text-center">
          <p className="secondary text-sm text-chino/80">
            No objectives yet. Create your first objective to get started.
          </p>
        </div>
      ) : null}

      {!isLoading &&
      objectives.length > 0 &&
      filteredObjectives.length === 0 ? (
        <ItemCard className="p-6 text-center">
          <p className="secondary text-sm text-chino/80">
            No objectives match the current filters.
          </p>
        </ItemCard>
      ) : null}

      {!isLoading && filteredObjectives.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredObjectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTask}
              onRemoveSubtask={handleRemoveSubtask}
              onStart={handleStartTask}
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

export default Objectives;
