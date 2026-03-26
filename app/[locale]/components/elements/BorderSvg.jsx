import React, { useId } from "react";

const BorderSvg = ({
  className = "",
  radius = 8,
  strokeWidth = 1.4,
  fadeAt = null,
}) => {
  const id = useId().replace(/:/g, "");
  const gradientId = `gradient-${id}`;

  return (
    <svg
      width="100%"
      height="100%"
      className={`absolute inset-0 pointer-events-none ${className}`}
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
          <stop offset="0%" stopColor="rgba(45, 212, 191, 0.95)" />
          {fadeAt !== null ? (
            <>
              <stop offset={`${fadeAt}%`} stopColor="rgba(45, 212, 191, 0.5)" />
              <stop
                offset={`${fadeAt + 20}%`}
                stopColor="rgba(45, 212, 191, 0)"
              />
              <stop offset="100%" stopColor="rgba(45, 212, 191, 0)" />
            </>
          ) : (
            <>
              <stop offset="45%" stopColor="rgba(45, 212, 191, 0.55)" />
              <stop offset="100%" stopColor="rgba(45, 212, 191, 0.2)" />
            </>
          )}
        </linearGradient>
      </defs>
    </svg>
  );
};

export default BorderSvg;
