import React, { useId } from "react";

const BORDER_COLORS = {
  teal: [
    "rgba(45, 212, 191, 0.95)",
    "rgba(45, 212, 191, 0.5)",
    "rgba(45, 212, 191, 0)",
    "rgba(45, 212, 191, 0.55)",
    "rgba(45, 212, 191, 0.2)",
  ],
  red: [
    "rgba(248, 113, 113, 0.95)",
    "rgba(248, 113, 113, 0.5)",
    "rgba(248, 113, 113, 0)",
    "rgba(248, 113, 113, 0.55)",
    "rgba(248, 113, 113, 0.2)",
  ],
  orange: [
    "rgba(249, 115, 22, 0.95)",
    "rgba(249, 115, 22, 0.5)",
    "rgba(249, 115, 22, 0)",
    "rgba(249, 115, 22, 0.55)",
    "rgba(249, 115, 22, 0.2)",
  ],
  yellow: [
    "rgba(234, 179, 8, 0.95)",
    "rgba(234, 179, 8, 0.5)",
    "rgba(234, 179, 8, 0)",
    "rgba(234, 179, 8, 0.55)",
    "rgba(234, 179, 8, 0.2)",
  ],
  cyan: [
    "rgba(6, 182, 212, 0.95)",
    "rgba(6, 182, 212, 0.5)",
    "rgba(6, 182, 212, 0)",
    "rgba(6, 182, 212, 0.55)",
    "rgba(6, 182, 212, 0.2)",
  ],
  sky: [
    "rgba(14, 165, 233, 0.95)",
    "rgba(14, 165, 233, 0.5)",
    "rgba(14, 165, 233, 0)",
    "rgba(14, 165, 233, 0.55)",
    "rgba(14, 165, 233, 0.2)",
  ],
  violet: [
    "rgba(167, 139, 250, 0.95)",
    "rgba(167, 139, 250, 0.5)",
    "rgba(167, 139, 250, 0)",
    "rgba(167, 139, 250, 0.55)",
    "rgba(167, 139, 250, 0.2)",
  ],
};

const BorderSvg = ({
  className = "",
  radius = 8,
  strokeWidth = 1.4,
  fadeAt = null,
  color = "teal",
}) => {
  const id = useId().replace(/:/g, "");
  const gradientId = `gradient-${id}`;
  const [c0, c1, c2, c3, c4] = BORDER_COLORS[color] ?? BORDER_COLORS.teal;

  return (
    <svg
      width="100%"
      height="100%"
      className={`absolute z-0 inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <rect
        stroke={`url(#${gradientId})`}
        fill="none"
        x={strokeWidth / 2}
        y={strokeWidth / 2}
        width={`calc(100% - ${strokeWidth}px)`}
        height={`calc(100% - ${strokeWidth}px)`}
        strokeWidth={strokeWidth}
        rx={radius}
      />
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={c0} />
          {fadeAt !== null ? (
            <>
              <stop offset={`${fadeAt}%`} stopColor={c1} />
              <stop offset={`${fadeAt + 20}%`} stopColor={c2} />
              <stop offset="100%" stopColor={c2} />
            </>
          ) : (
            <>
              <stop offset="45%" stopColor={c3} />
              <stop offset="100%" stopColor={c4} />
            </>
          )}
        </linearGradient>
      </defs>
    </svg>
  );
};

export default BorderSvg;
