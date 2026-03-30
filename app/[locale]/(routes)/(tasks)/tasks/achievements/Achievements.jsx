"use client";

import Button from "@/app/[locale]/components/buttons/Button";
import ObjectiveCard from "../(componets)/ObjectiveCard";
import TasksHeader from "../(componets)/ObjectivesHeader";
import ObjectivesSideBar from "../(componets)/ObjectivesSideBar";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import { setToast, clearToast } from "@/app/[locale]/lib/features/toastSlice";
import { selectModal } from "@/app/[locale]/lib/features/modalSlice";
import { useModal } from "@/app/[locale]/lib/hooks/useModal";
import { useAchievements } from "@/app/[locale]/lib/hooks/useAchievements";
import { ACTIVE_QUESTS_PAGE1_KEY } from "@/app/[locale]/lib/hooks/useActiveQuests";
import {
  EMPTY_FILTERS,
  applyObjectivesFilters,
  searchItems,
  OBJECTIVE_SEARCH_FIELDS,
} from "@/app/[locale]/lib/utils/filterConfig";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mutate as globalMutate } from "swr";

const Achievements = ({ initialData = null }) => {
  const dispatch = useDispatch();
  const { open } = useModal();
  const { modalType } = useSelector(selectModal);
  const lastModalTypeRef = useRef(modalType);

  const {
    achievements: swrAchievements,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    mutate,
  } = useAchievements(initialData);

  // Local copy kept for consistent card rendering behavior
  const [achievements, setAchievements] = useState(swrAchievements);
  useEffect(() => {
    setAchievements(swrAchievements);
  }, [swrAchievements]);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Revalidate when the edit modal closes so changes are reflected
  useEffect(() => {
    const wasEditOpen = lastModalTypeRef.current === "editObjective";
    if (wasEditOpen && modalType === null) {
      mutate(); // revalidate achievements
      globalMutate(ACTIVE_QUESTS_PAGE1_KEY); // revalidate active quests if status changed
    }
    lastModalTypeRef.current = modalType;
  }, [modalType, mutate]);

  const handleOpenEdit = (achievement) => {
    dispatch(clearToast());
    open("editObjective", { objective: achievement });
  };

  const handleFiltersApply = (allFilters) => setFilters(allFilters);

  const handleAddSubtask = useCallback(
    async (achievement) => {
      setAchievements((prev) => prev.filter((a) => a.id !== achievement.id));
      try {
        const response = await fetch(
          `/api/user/task/achievements?id=${encodeURIComponent(
            achievement.id,
          )}`,
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
          setToast({
            type: "success",
            msg: "Task moved to Active Quests",
          }),
        );
        mutate(); // invalidate achievements cache
        globalMutate(ACTIVE_QUESTS_PAGE1_KEY); // populate active-quests cache
      } catch (error) {
        mutate(); // rollback
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

  const searched = searchItems(
    achievements,
    searchQuery,
    OBJECTIVE_SEARCH_FIELDS,
  );
  const filteredAchievements = applyObjectivesFilters(searched, filters);

  return (
    <section className="w-full grow p-4 lg:p-8 flex flex-col gap-3">
      <TasksHeader
        items={achievements}
        title="Achievements"
        subtitle="Completed tasks that you have already finished."
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
        objectives={achievements}
        filters={filters}
        onFiltersApply={handleFiltersApply}
      />

      {isLoading ? (
        <p className="secondary text-sm text-chino/70">Loading achievements...</p>
      ) : null}

      {!isLoading && achievements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-teal-500/25 bg-black/35 p-6 text-center">
          <p className="secondary text-sm text-chino/80">
            No achievements yet. Complete a task in Active Quests to see it
            here.
          </p>
        </div>
      ) : null}

      {!isLoading &&
      achievements.length > 0 &&
      filteredAchievements.length === 0 ? (
        <ItemCard className="p-6 text-center">
          <p className="secondary text-sm text-chino/80">
            No achievements match the current filters.
          </p>
        </ItemCard>
      ) : null}

      {!isLoading && filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredAchievements.map((achievement) => (
            <ObjectiveCard
              key={achievement.id}
              objective={achievement}
              onEdit={handleOpenEdit}
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

export default Achievements;
