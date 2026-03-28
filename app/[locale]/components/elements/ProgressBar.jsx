import React from "react";

const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showPct = true,
  className = "",
}) => {
  const clamped = Math.min(Math.max(value, 0), max);
  const pct = max === 0 ? 0 : Math.round((clamped / max) * 100);

  return (
    <div className={`space-y-1 ${className}`}>
      {(label || showPct) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="secondary text-xs uppercase tracking-[0.14em] text-white/80">
              {label}
            </span>
          )}
          {showPct && (
            <span className="secondary text-xs font-semibold text-green-500">
              {pct}%
            </span>
          )}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-green-500/30">
        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={max}
          style={{
            width: `${pct}%`,
            transition: "width 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="h-full rounded-full bg-green-500"
        />
      </div>
    </div>
  );
};

export default ProgressBar;
