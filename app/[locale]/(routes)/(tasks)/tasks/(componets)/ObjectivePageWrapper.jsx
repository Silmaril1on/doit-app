"use client";
import Button from "@/app/[locale]/components/buttons/Button";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import SearchBar from "@/app/[locale]/components/forms/SearchBar";
import DonutChart from "@/app/[locale]/components/elements/DonutChart";
import ObjectiveCard from "./ObjectiveCard";
import ObjectivesSideBar from "./ObjectivesSideBar";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdFilterAltOff } from "react-icons/md";
import { IoIosAdd } from "react-icons/io";
import { clearToast } from "@/app/[locale]/lib/features/toastSlice";
import { selectModal } from "@/app/[locale]/lib/features/modalSlice";
import { useModal } from "@/app/[locale]/lib/hooks/useModal";
import {
  EMPTY_FILTERS,
  applyObjectivesFilters,
  searchItems,
  OBJECTIVE_SEARCH_FIELDS,
} from "@/app/[locale]/lib/utils/filterConfig";

const ObjectivePageWrapper = ({
  items = [],
  hasMore = false,
  isLoading = false,
  isLoadingMore = false,
  loadMore,
  title = "Objectives",
  subtitle = "Build clear goals, track progress, and keep momentum.",
  showCreateButton = false,
  buttonLabel,
  emptyMessage = "Nothing here yet.",
  revalidateOnModalClose = [],
  onModalClose,
  completedView = false,
  onDelete,
  onStart,
  onComplete,
  onToggleSubtask,
  onRemoveSubtask,
  showHeader = true,
  showSidebar = true,
  renderCardBefore = null,
  readOnly = false,
}) => {
  const dispatch = useDispatch();
  const { open } = useModal();
  const { modalType } = useSelector(selectModal);
  const lastModalTypeRef = useRef(modalType);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fire onModalClose once when a watched modal transitions to closed
  useEffect(() => {
    const wasWatched = revalidateOnModalClose.includes(
      lastModalTypeRef.current,
    );
    if (wasWatched && modalType === null) {
      onModalClose?.();
    }
    lastModalTypeRef.current = modalType;
  }, [modalType, onModalClose, revalidateOnModalClose]);

  const handleOpenCreate = useCallback(() => {
    dispatch(clearToast());
    open("createObjective");
  }, [dispatch, open]);

  const handleOpenEdit = useCallback(
    (item) => {
      dispatch(clearToast());
      open("editObjective", { objective: item });
    },
    [dispatch, open],
  );

  const derivedButtonLabel =
    buttonLabel ??
    (items.length > 0 ? "Create Objective" : "Create First Objective");

  const searched = searchItems(items, searchQuery, OBJECTIVE_SEARCH_FIELDS);
  const filteredItems = applyObjectivesFilters(searched, filters);
  const hasActiveFilters = Object.values(filters).some((v) => v?.length > 0);

  return (
    <section className="w-full grow pb-28 flex flex-col gap-3 bg-black">
      <SectionHeadline title={title} subtitle={subtitle} />
      {showHeader && (
        <>
          <ItemCard className="w-full">
            <DonutChart items={items} showLegend />
          </ItemCard>
          <div className="flex items-center gap-2">
            <ActionButton variant="menu" onClick={() => setSidebarOpen(true)} />
            {hasActiveFilters && (
              <ActionButton
                icon={<MdFilterAltOff />}
                onClick={() => setFilters(EMPTY_FILTERS)}
                ariaLabel="Clear filters"
              />
            )}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search objectives…"
              className="flex-1"
            />
            {showCreateButton && (
              <Button
                icon={<IoIosAdd size={20} />}
                text={derivedButtonLabel}
                onClick={handleOpenCreate}
              />
            )}
          </div>
        </>
      )}

      {showSidebar && (
        <ObjectivesSideBar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          objectives={items}
          filters={filters}
          onFiltersApply={setFilters}
        />
      )}

      {isLoading && items.length === 0 && (
        <p className="secondary text-sm text-chino/70">
          Loading {title.toLowerCase()}...
        </p>
      )}

      {!isLoading && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-teal-500/25 bg-black/35 p-6 text-center">
          <p className="secondary text-sm text-chino/80">{emptyMessage}</p>
        </div>
      )}

      {!isLoading && items.length > 0 && filteredItems.length === 0 && (
        <ItemCard className="p-6 text-center">
          <p className="secondary text-sm text-chino/80">
            No {title.toLowerCase()} match the current filters.
          </p>
        </ItemCard>
      )}

      {filteredItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredItems.map((item) =>
            renderCardBefore ? (
              <div key={item.id} className="flex flex-col">
                {renderCardBefore(item)}
                <ObjectiveCard
                  objective={item}
                  onEdit={handleOpenEdit}
                  onDelete={onDelete}
                  onStart={onStart}
                  onComplete={onComplete}
                  onToggleSubtask={onToggleSubtask}
                  onRemoveSubtask={onRemoveSubtask}
                  completedView={completedView}
                  readOnly={readOnly}
                />
              </div>
            ) : (
              <ObjectiveCard
                key={item.id}
                objective={item}
                onEdit={handleOpenEdit}
                onDelete={onDelete}
                onStart={onStart}
                onComplete={onComplete}
                onToggleSubtask={onToggleSubtask}
                onRemoveSubtask={onRemoveSubtask}
                completedView={completedView}
                readOnly={readOnly}
              />
            ),
          )}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            text={isLoadingMore ? "Loading..." : "Load More"}
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
          />
        </div>
      )}
    </section>
  );
};

export default ObjectivePageWrapper;
