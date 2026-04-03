import ItemCard from "@/app/[locale]/components/container/ItemCard";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import Button from "@/app/[locale]/components/buttons/Button";
import Tablet from "@/app/[locale]/components/elements/Tablet";
import { CountryFlags } from "@/app/[locale]/components/elements/CountryFlags";
import { formatDate } from "@/app/[locale]/lib/utils/utils";
import ProgressBar from "@/app/[locale]/components/elements/ProgressBar";
import { TASK_CATEGORIES } from "@/app/[locale]/lib/local-bd/categoryTypesData";
import React, { useRef, useState, useEffect } from "react";
import { IoMdClose, IoMdArrowDropright, IoIosCheckmark } from "react-icons/io";
import { AnimatePresence } from "framer-motion";
import UploadGalleryModal from "../achievements/UploadGalleryModal";
import ViewGalleryModal from "../achievements/ViewGalleryModal";

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
}) => {
  const status = objective.status || "todo";
  const priority = objective.priority || "medium";
  const categoryData =
    TASK_CATEGORIES.find((c) => c.id === Number(objective.task_category)) ??
    null;
  const subtasks = Array.isArray(objective.subtasks) ? objective.subtasks : [];
  const countryAndCity = { country: objective.country, city: objective.city };
  const hasLocation = Boolean(objective.country || objective.city);

  const canEdit = typeof onEdit === "function";
  const canDelete = typeof onDelete === "function";
  const hasActions = canEdit || canDelete;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [localGallery, setLocalGallery] = useState(
    Array.isArray(objective.task_gallery) ? objective.task_gallery : [],
  );

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

  return (
    <>
      <ItemCard className="space-y-3 rounded-xl border border-teal-500/20 bg-black/45 p-4">
        {/* Card header  */}
        <div className="flex items-start justify-between gap-3">
          <div className="leading-none mb-5">
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

        {/* Card Category and tablets  */}
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
          gallery={localGallery}
          onUploadClick={() => setUploadOpen(true)}
          onViewClick={() => setViewOpen(true)}
        />
      </ItemCard>

      <AnimatePresence>
        {uploadOpen && (
          <UploadGalleryModal
            objective={objective}
            gallery={localGallery}
            onClose={() => setUploadOpen(false)}
            onUploaded={(g) => setLocalGallery(g)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewOpen && localGallery.length > 0 && (
          <ViewGalleryModal
            gallery={localGallery}
            onClose={() => setViewOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
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
  gallery,
  onUploadClick,
  onViewClick,
}) => {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="grid grid-cols-2 gap-1 text-xs text-cream secondary flex-1">
        {formatDate(objective.update_at) !== "—" && (
          <div className="flex items-center gap-1">
            <span className="text-chino/80">Updated:</span>
            {formatDate(objective.update_at)}
          </div>
        )}
        {formatDate(objective.created_at) !== "—" && (
          <div className="flex items-center gap-1">
            <span className="text-chino/80">Created:</span>
            {formatDate(objective.created_at)}
          </div>
        )}
        {objective.status === "completed" && (
          <div className="flex items-center gap-1">
            <span className="text-chino/80">Completed:</span>
            {formatDate(objective.completed_at || objective.update_at)}
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
        {completedView && (
          <Button
            text="Upload Image"
            variant="outline"
            size="sm"
            onClick={onUploadClick}
          />
        )}
        {completedView && gallery.length > 0 && (
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

export default ObjectiveCard;
