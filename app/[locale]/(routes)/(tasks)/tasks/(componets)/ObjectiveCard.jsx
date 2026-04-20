"use client";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import Button from "@/app/[locale]/components/buttons/Button";
import Tablet from "@/app/[locale]/components/elements/Tablet";
import { CountryFlags } from "@/app/[locale]/components/elements/CountryFlags";
import { formatDate } from "@/app/[locale]/lib/utils/utils";
import ProgressBar from "@/app/[locale]/components/elements/ProgressBar";
import { TASK_CATEGORIES } from "@/app/[locale]/lib/local-bd/categoryTypesData";
import { openModal } from "@/app/[locale]/lib/features/modalSlice";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { IoMdClose, IoMdArrowDropright, IoIosCheckmark } from "react-icons/io";
import { AiFillFire, AiOutlineFire } from "react-icons/ai";
import { MdOutlineReviews, MdReviews } from "react-icons/md";
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";
import Image from "next/image";
import AvatarTag from "@/app/[locale]/components/elements/AvatarTag";

const priorityColorMap = {
  low: "blue",
  medium: "violet",
  high: "red",
};

const statusColorMap = {
  todo: "sky",
  in_progress: "green",
  completed: "green",
};

const EMPTY_LIST = [];

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ObjectiveCard = ({
  objective,
  onEdit,
  onDelete,
  onRemoveSubtask,
  onToggleSubtask,
  onComplete,
  onStart,
  completedView = false,
  readOnly = false,
}) => {
  const dispatch = useDispatch();
  const status = objective.status || "todo";
  const priority = objective.priority || "medium";
  const categoryData =
    TASK_CATEGORIES.find((c) => c.id === Number(objective.task_category)) ??
    null;
  const subtasks = Array.isArray(objective.subtasks)
    ? objective.subtasks
    : EMPTY_LIST;
  const countryAndCity = { country: objective.country, city: objective.city };
  const hasLocation = Boolean(objective.country || objective.city);
  const canEdit = !readOnly && typeof onEdit === "function";
  const canDelete = !readOnly && typeof onDelete === "function";
  const hasActions = canEdit || canDelete;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const gallery = Array.isArray(objective.task_gallery)
    ? objective.task_gallery
    : EMPTY_LIST;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleOpenUploadGallery = useCallback(() => {
    setMenuOpen(false);
    dispatch(
      openModal({
        modalType: "uploadGallery",
        modalProps: {
          objective,
          gallery,
        },
      }),
    );
  }, [dispatch, objective, gallery]);

  const handleOpenViewGallery = useCallback(() => {
    dispatch(
      openModal({
        modalType: "viewGallery",
        modalProps: {
          objectiveId: objective.id,
          subtasks,
          taskTitle: objective.task_title,
        },
      }),
    );
  }, [dispatch, objective.id, objective.task_title, subtasks]);

  const owner = readOnly ? objective.user : null;

  return (
    <>
      {owner && (
        <div className="flex items-center justify-start">
          <AvatarTag user={owner} size="sm" />
        </div>
      )}
      <ItemCard className="space-y-3 rounded-xl border border-teal-500/20 bg-black/45 p-4">
        <CardHeader
          objective={objective}
          hasActions={hasActions}
          canEdit={canEdit}
          canDelete={canDelete}
          completedView={completedView}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          menuRef={menuRef}
          onEdit={onEdit}
          onDelete={onDelete}
          onUploadGallery={handleOpenUploadGallery}
          readOnly={readOnly}
        />
        <CardCategorySection
          categoryData={categoryData}
          countryAndCity={countryAndCity}
          status={status}
          priority={priority}
          hasLocation={hasLocation}
        />
        <SubTasksSection
          objective={objective}
          subtasks={subtasks}
          onToggleSubtask={onToggleSubtask}
          onRemoveSubtask={onRemoveSubtask}
          completedView={completedView}
        />
        <CardFooter
          objective={objective}
          onStart={onStart}
          onComplete={onComplete}
          completedView={completedView}
          readOnly={readOnly}
          onViewClick={handleOpenViewGallery}
        />
        {readOnly && (
          <CardFeedActions
            objective={objective}
            objectiveId={objective.id}
            taskOwnerId={objective.user_id}
            initialLikeCount={objective.like_count ?? 0}
            initialIsLiked={objective.is_liked ?? false}
            initialReviewCount={objective.review_count ?? 0}
            initialRecreateCount={objective.recreate_count ?? 0}
          />
        )}
      </ItemCard>
    </>
  );
};

const CardHeader = ({
  objective,
  hasActions,
  canEdit,
  canDelete,
  completedView,
  menuOpen,
  setMenuOpen,
  menuRef,
  onEdit,
  onDelete,
  onUploadGallery,
}) => {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="leading-none mb-5 w-full">
        <h2 className="text-2xl capitalize font-bold text-cream">
          {objective.task_title}
        </h2>
        <p className="secondary text-sm leading-4.5 text-chino">
          {objective.task_description}
        </p>
      </div>
      {hasActions ? (
        <div
          ref={menuRef}
          className="relative shrink-0 flex items-center gap-2"
        >
          <ActionButton
            variant="expand"
            onClick={() => setMenuOpen((prev) => !prev)}
            ariaLabel="Open actions menu"
          />
          {menuOpen && (
            <div className="absolute right-10 -top-3 mt-1.5 z-10 flex gap-2 rounded-xl border border-teal-500/20 bg-black/20 backdrop-blur-md p-1.5">
              {completedView ? (
                <ActionButton
                  variant="uploadImage"
                  onClick={onUploadGallery}
                  ariaLabel="Upload image"
                />
              ) : null}
              {canEdit ? (
                <ActionButton
                  variant="edit"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(objective);
                  }}
                  ariaLabel="Edit objective"
                />
              ) : null}
              {canDelete ? (
                <ActionButton
                  variant="delete"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(objective);
                  }}
                  ariaLabel="Delete objective"
                />
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

const CardCategorySection = ({
  categoryData,
  countryAndCity,
  status,
  priority,
  hasLocation,
}) => {
  return (
    <div className=" ">
      <div className="gap-1 flex flex-col items-start mb-4">
        {categoryData ? (
          <div>
            <p className="secondary text-xs uppercase tracking-[0.14em] text-teal-200/85">
              Category: {categoryData.label}
            </p>
            <p className="secondary capitalize text-[10px] text-chino">
              {categoryData.description}
            </p>
          </div>
        ) : (
          <p className="secondary  text-xs uppercase tracking-[0.14em] text-teal-200/85">
            Category: —
          </p>
        )}
      </div>
      <div className="flex justify-between items-center">
        {hasLocation && (
          <CountryFlags data={countryAndCity} title={true} size="sm" />
        )}
        <div className="flex items-center gap-2">
          <Tablet
            text={formatLabel(status)}
            color={statusColorMap[status] || "sky"}
          />
          <Tablet
            text={formatLabel(priority)}
            color={priorityColorMap[priority] || priorityColorMap.medium}
          />
        </div>
      </div>
    </div>
  );
};

const SubTasksSection = ({
  objective,
  subtasks,
  onToggleSubtask,
  onRemoveSubtask,
  completedView = false,
}) => {
  const completedCount = completedView
    ? subtasks.length
    : subtasks.filter((st) => typeof st === "object" && st.completed).length;
  const showProgress =
    (Boolean(onToggleSubtask) || completedView) && subtasks.length > 0;

  return (
    <>
      {subtasks.length > 0 && (
        <div className="rounded-lg border border-teal-500/20 bg-black/35 p-3">
          <p className="secondary text-xs uppercase tracking-[0.14em] text-white/80">
            Subtasks
          </p>
          <ul className="mt-2 space-y-1 text-xs secondary ">
            {subtasks.map((subtask, index) => {
              const label =
                typeof subtask === "object" ? subtask.label : subtask;
              const isCompleted =
                completedView ||
                (typeof subtask === "object"
                  ? Boolean(subtask.completed)
                  : false);
              return (
                <div
                  key={`${objective.id}-subtask-${index}`}
                  className="group hover:pl-3 flex items-center justify-between gap-2 rounded-md px-1 duration-300"
                >
                  {onToggleSubtask ? (
                    <button
                      type="button"
                      onClick={() => onToggleSubtask(objective, index)}
                      aria-label={`Toggle subtask ${index + 1}`}
                      className={`flex items-center gap-0.5 text-left font-medium duration-300 ${
                        isCompleted ? "text-green-500" : "text-chino/85"
                      }`}
                    >
                      {isCompleted ? (
                        <IoIosCheckmark size={18} className="shrink-0" />
                      ) : (
                        <IoMdArrowDropright size={18} className="shrink-0" />
                      )}
                      <span className="capitalize">{label}</span>
                    </button>
                  ) : (
                    <span
                      className={`flex cursor-pointer  items-center gap-0.5 font-medium ${
                        isCompleted ? "text-green-500" : "text-chino/85"
                      }`}
                    >
                      {isCompleted ? (
                        <IoIosCheckmark size={18} className="shrink-0" />
                      ) : (
                        <IoMdArrowDropright size={16} className="shrink-0" />
                      )}
                      <span className="capitalize">{label}</span>
                    </span>
                  )}
                  {onRemoveSubtask ? (
                    <button
                      type="button"
                      onClick={() => onRemoveSubtask?.(objective, index)}
                      aria-label={`Remove subtask ${index + 1}`}
                      className="cursor-pointer text-red-500 opacity-0 duration-300 group-hover:opacity-100"
                    >
                      <IoMdClose size={16} />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </ul>
          {showProgress && (
            <ProgressBar
              value={completedCount}
              max={subtasks.length}
              label="Task Progress"
              className="mt-3"
            />
          )}
        </div>
      )}
    </>
  );
};

const CardFooter = ({
  objective,
  onStart,
  onComplete,
  completedView,
  readOnly = false,
  onViewClick,
}) => {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="grid md:grid-cols-2 gap-1 text-xs text-cream secondary flex-1 ">
        {objective.status === "completed" && (
          <div className="flex items-center gap-1">
            <span className="text-chino/80">Completed:</span>
            {formatDate(objective.completed_at || objective.update_at)}
          </div>
        )}

        {formatDate(objective.created_at) !== "—" && (
          <div className="flex items-center gap-1">
            <span className="text-chino/80">Created:</span>
            {formatDate(objective.created_at)}
          </div>
        )}
        {formatDate(objective.update_at) !== "—" && (
          <div className="flex items-center gap-1">
            <span className="text-chino/80">Updated:</span>
            {formatDate(objective.update_at)}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 *:w-full">
        {onStart && (
          <Button
            text="Start Task"
            variant="outline"
            size="sm"
            onClick={() => onStart(objective)}
          />
        )}
        {onComplete && (
          <Button
            text="Complete"
            variant="outline"
            size="sm"
            onClick={() => onComplete(objective)}
          />
        )}
        {(completedView || readOnly) && (
          <Button
            text="View Gallery"
            size="sm"
            variant="outline"
            onClick={onViewClick}
          />
        )}
      </div>
    </div>
  );
};

const CardFeedActions = ({
  objective,
  objectiveId,
  taskOwnerId,
  initialLikeCount = 0,
  initialIsLiked = false,
  initialReviewCount = 0,
  initialRecreateCount = 0,
}) => {
  const dispatch = useDispatch();
  const [liked, setLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const isReviewed = reviewCount > 0;
  const [recreateCount, setRecreateCount] = useState(initialRecreateCount);
  const [hasRecreated, setHasRecreated] = useState(false);

  // Sync review count from ThoughsModal
  useEffect(() => {
    const handler = (e) => {
      if (e.detail.taskId === objectiveId) {
        setReviewCount(e.detail.reviewCount);
      }
    };
    window.addEventListener("thoughtsUpdated", handler);
    return () => window.removeEventListener("thoughtsUpdated", handler);
  }, [objectiveId]);

  // Sync recreate count from CreateTaskModal
  useEffect(() => {
    const handler = (e) => {
      if (e.detail.taskId === objectiveId) {
        setRecreateCount((c) => c + 1);
        setHasRecreated(true);
      }
    };
    window.addEventListener("taskRecreated", handler);
    return () => window.removeEventListener("taskRecreated", handler);
  }, [objectiveId]);

  const handleToggleLike = async () => {
    if (likeLoading) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? likeCount - 1 : likeCount + 1);
    setLikeLoading(true);
    try {
      let res;
      if (!prevLiked) {
        res = await fetch("/api/user/task/feed-likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task_id: objectiveId,
            task_owner_id: taskOwnerId,
          }),
        });
      } else {
        res = await fetch(
          `/api/user/task/feed-likes?taskId=${encodeURIComponent(objectiveId)}`,
          { method: "DELETE" },
        );
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLikeCount(data.like_count);
      setLiked(data.liked);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleOpenThoughts = () => {
    dispatch(
      openModal({
        modalType: "thoughts",
        modalProps: { taskId: objectiveId, taskOwnerId },
      }),
    );
  };

  const handleRecreate = () => {
    dispatch(
      openModal({
        modalType: "recreateObjective",
        modalProps: {
          objective,
          originalTaskId: objectiveId,
        },
      }),
    );
  };

  return (
    <div className="flex items-center gap-1.5 pt-1">
      {/* Fire / Like */}
      <ActionButton
        color="orange"
        active={liked}
        icon={<AiOutlineFire size={14} />}
        activeIcon={<AiFillFire size={14} />}
        count={likeCount}
        text={likeCount !== 1 ? "Fires" : "Fire"}
        onClick={handleToggleLike}
        disabled={likeLoading}
      />

      {/* Thoughts / Reviews */}
      <ActionButton
        color="yellow"
        active={isReviewed}
        icon={<MdOutlineReviews size={14} />}
        activeIcon={<MdReviews size={14} />}
        count={reviewCount}
        text={reviewCount !== 1 ? "Thoughts" : "Thought"}
        onClick={handleOpenThoughts}
      />

      {/* Recreate */}
      <ActionButton
        color="cyan"
        active={hasRecreated || recreateCount > 0}
        icon={<IoBookmarkOutline size={13} />}
        activeIcon={<IoBookmark size={13} />}
        count={recreateCount}
        text={recreateCount !== 1 ? "Recreates" : "Recreate"}
        onClick={handleRecreate}
      />
    </div>
  );
};

export default ObjectiveCard;
