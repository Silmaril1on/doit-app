import ItemCard from "@/app/[locale]/components/container/ItemCard";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import Tablet from "@/app/[locale]/components/elements/Tablet";
import { CountryFlags } from "@/app/[locale]/components/elements/CountryFlags";
import { formatDate } from "@/app/[locale]/lib/utils/utils";
import React, { useRef, useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";

const priorityColorMap = {
  low: "blue",
  medium: "violet",
  high: "red",
};

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ObjectiveCard = ({ objective, onEdit, onRemoveSubtask }) => {
  const status = objective.status || "todo";
  const priority = objective.priority || "medium";
  const category = objective.task_category || "General";
  const subtasks = Array.isArray(objective.subtasks) ? objective.subtasks : [];
  const countryAndCity = { country: objective.country, city: objective.city };
  const hasLocation = Boolean(objective.country || objective.city);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
        <div ref={menuRef} className="relative shrink-0">
          <ActionButton
            variant="expand"
            onClick={() => setMenuOpen((prev) => !prev)}
            ariaLabel="Open actions menu"
          />
          {menuOpen && (
            <div className="absolute right-10 -top-3 mt-1.5 z-10 flex gap-2 rounded-xl border border-teal-500/20 bg-black/20 backdrop-blur-md p-1.5">
              <ActionButton
                variant="edit"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit?.(objective);
                }}
                ariaLabel="Edit objective"
              />
              <ActionButton
                variant="delete"
                onClick={() => {
                  setMenuOpen(false);
                }}
                ariaLabel="Delete objective"
              />
            </div>
          )}
        </div>
      </div>

      {/* Card Category and tablets  */}
      <div className="flex justify-between items-center">
        <div className="gap-1 flex flex-col items-start">
          <p className="secondary text-xs uppercase tracking-[0.14em] text-teal-200/85">
            Category: {category}
          </p>
          {hasLocation && (
            <CountryFlags data={countryAndCity} title={true} size="sm" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Tablet text={formatLabel(status)} color="sky" />
          <Tablet
            text={formatLabel(priority)}
            color={priorityColorMap[priority] || priorityColorMap.medium}
          />
        </div>
      </div>
      {/* Card Subtasks */}
      {subtasks.length > 0 && (
        <div className="rounded-lg border border-teal-500/20 bg-black/35 p-3">
          <p className="secondary text-xs uppercase tracking-[0.14em] text-white/80">
            Subtasks
          </p>
          <ul className="mt-2 space-y-1 text-xs text-chino/85 secondary">
            {subtasks.map((subtask, index) => (
              <li
                key={`${objective.id}-subtask-${index}`}
                className="group flex items-center justify-between gap-2"
              >
                <span className="duration-300 group-hover:pl-3 cursor-pointer">
                  • {subtask}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveSubtask?.(objective, index)}
                  aria-label={`Remove subtask ${index + 1}`}
                  className="cursor-pointer text-red-300 opacity-0 duration-300 group-hover:opacity-100 hover:text-red-200"
                >
                  <IoMdClose size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Card Footer */}
      <div className="grid grid-cols-2 gap-1 text-xs text-cream secondary">
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
      </div>
    </ItemCard>
  );
};

export default ObjectiveCard;
