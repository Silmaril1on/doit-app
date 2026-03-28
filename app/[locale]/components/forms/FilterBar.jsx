"use client";
import { useState } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import { CountryFlags } from "@/app/[locale]/components/elements/CountryFlags";

// ── single collapsible section with checkboxes ───────────────────────────────

const FilterSection = ({ config, selected, onChange }) => {
  const [open, setOpen] = useState(false);

  const toggle = (value) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(config.key, next);
  };

  return (
    <div className="border-b border-teal-500/15">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-3 cursor-pointer"
      >
        <span className="primary text-sm text-teal-300">{config.label}</span>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="secondary text-xs text-teal-400/70">
              {selected.length} selected
            </span>
          )}
          <FaChevronDown
            size={10}
            className={`text-teal-400/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <ul className="pb-3 space-y-2.5">
          {config.options.map(({ label, value, count }) => {
            const checked = selected.includes(value);
            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => toggle(value)}
                  className="flex w-full items-center gap-2.5 cursor-pointer group"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 duration-200 ${
                      checked
                        ? "border-teal-500 bg-teal-500"
                        : "border-teal-500/40 bg-transparent group-hover:border-teal-500/70"
                    }`}
                  >
                    {checked && <FaCheck size={8} className="text-black" />}
                  </span>
                  <span className="secondary text-sm text-chino capitalize flex-1 text-left flex items-center gap-1.5">
                    {label?.flag ? (
                      <CountryFlags data={label.flag} title size="sm" />
                    ) : (
                      label
                    )}
                  </span>
                  {count !== undefined && (
                    <span className="secondary text-xs text-chino/50">
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const FilterBar = ({ configs = [], values = {}, onChange, onReset }) => {
  const activeConfigs = configs.filter((cfg) => cfg.options.length > 0);
  const hasActive = activeConfigs.some(
    (cfg) => (values[cfg.key] ?? []).length > 0,
  );

  if (activeConfigs.length === 0) {
    return (
      <p className="secondary text-xs text-chino/50 pt-2">
        No filter options available.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1 mr-3">
        <p className="secondary text-xs uppercase tracking-[0.14em] text-teal-200/60">
          Filters
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="secondary text-xs text-chino/60 hover:text-teal-300 duration-200 cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {activeConfigs.map((cfg) => (
        <FilterSection
          key={cfg.key}
          config={cfg}
          selected={values[cfg.key] ?? []}
          onChange={onChange}
        />
      ))}
    </div>
  );
};

export default FilterBar;
