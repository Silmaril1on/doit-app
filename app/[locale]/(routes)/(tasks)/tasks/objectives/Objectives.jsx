"use client";

import TasksHeader from "../(componets)/TasksHeader";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { useModal } from "@/app/[locale]/lib/hooks/useModal";
import { selectModal } from "@/app/[locale]/lib/features/modalSlice";
import ObjectiveCard from "../(componets)/ObjectiveCard";
import {
  EMPTY_FILTERS,
  applyObjectivesFilters,
  searchItems,
  OBJECTIVE_SEARCH_FIELDS,
} from "@/app/[locale]/lib/utils/filterConfig";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Objectives = () => {
  const dispatch = useDispatch();
  const { open } = useModal();
  const currentUser = useSelector(selectCurrentUser);
  const { modalType } = useSelector(selectModal);
  const [objectives, setObjectives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const lastModalTypeRef = useRef(modalType);

  const loadObjectives = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/task/objectives?status=todo", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load objectives");
      }

      setObjectives(Array.isArray(data.objectives) ? data.objectives : []);
    } catch (error) {
      dispatch(
        setToast({
          type: "error",
          msg:
            error instanceof Error
              ? error.message
              : "Failed to load objectives",
        }),
      );
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [dispatch]);

  useEffect(() => {
    loadObjectives();
  }, [loadObjectives]);

  useEffect(() => {
    const wasObjectiveModalOpen = ["createObjective", "editObjective"].includes(
      lastModalTypeRef.current,
    );

    if (wasObjectiveModalOpen && modalType === null) {
      loadObjectives();
    }

    lastModalTypeRef.current = modalType;
  }, [modalType, loadObjectives]);

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
      } catch (error) {
        loadObjectives();
        dispatch(
          setToast({
            type: "error",
            msg: error instanceof Error ? error.message : "Failed to start task",
          }),
        );
      }
    },
    [dispatch, loadObjectives],
  );

  const searched = searchItems(objectives, searchQuery, OBJECTIVE_SEARCH_FIELDS);
  const filteredObjectives = applyObjectivesFilters(searched, filters);

  const handleRemoveSubtask = async (objective, subtaskIndex) => {
    const currentSubtasks = Array.isArray(objective?.subtasks)
      ? objective.subtasks
      : [];
    if (currentSubtasks.length === 0 || subtaskIndex < 0) {
      return;
    }

    const nextSubtasks = currentSubtasks.filter(
      (_, index) => index !== subtaskIndex,
    );

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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subtasks: nextSubtasks }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update subtasks");
      }
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

  const buttonLabel =
    objectives.length > 0 ? "Create Objective" : "Create First Objective";

  return (
    <section className="w-full grow p-4 lg:p-8 flex flex-col gap-3">
      <TasksHeader
        objectives={objectives}
        buttonLabel={buttonLabel}
        onCreateClick={handleOpenCreate}
        filters={filters}
        onFiltersApply={handleFiltersApply}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      {isLoading ? (
        <p className="secondary text-sm text-chino/70">Loading objectives...</p>
      ) : null}

      {!isLoading && hasLoaded && objectives.length === 0 ? (
        <div className="rounded-xl border border-dashed border-teal-500/25 bg-black/35 p-6 text-center">
          <p className="secondary text-sm text-chino/80">
            No objectives yet. Create your first objective to get started.
          </p>
        </div>
      ) : null}

      {!isLoading && hasLoaded && objectives.length > 0 && filteredObjectives.length === 0 ? (
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
              onRemoveSubtask={handleRemoveSubtask}
              onStart={handleStartTask}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default Objectives;
