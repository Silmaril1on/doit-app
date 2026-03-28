"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import Button from "@/app/[locale]/components/buttons/Button";
import FilterBar from "@/app/[locale]/components/forms/FilterBar";
import {
  buildObjectivesFilterConfig,
  EMPTY_FILTERS,
} from "@/app/[locale]/lib/utils/filterConfig";

const ObjectivesSideBar = ({
  isOpen,
  onClose,
  objectives = [],
  filters,
  onFiltersApply,
}) => {
  const [pendingFilters, setPendingFilters] = useState(
    filters ?? EMPTY_FILTERS,
  );

  const handlePendingChange = (key, values) => {
    setPendingFilters((prev) => ({ ...prev, [key]: values }));
  };

  const handleDone = () => {
    onFiltersApply?.(pendingFilters);
    onClose();
  };

  const configs = buildObjectivesFilterConfig(objectives);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sidebar-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed flex justify-start items-center inset-0 z-30 bg-black/40 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.aside
            key="sidebar-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="z-40 h-[75%] w-72 bg-[#0b1a18] rounded-r-[150px] flex flex-col shadow-[2px_2px_20px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-start gap-3 p-4 w-[90%] border-b border-teal-500/15">
              <ActionButton variant="close" onClick={onClose} />
              <span className="primary text-teal-300 font-bold text-lg">
                Menu
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <FilterBar
                configs={configs}
                values={pendingFilters}
                onChange={handlePendingChange}
                onReset={() => setPendingFilters(EMPTY_FILTERS)}
              />
            </div>

            <div className="p-4">
              <Button text="Done" variant="fill" onClick={handleDone} />
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ObjectivesSideBar;
