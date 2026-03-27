import React, { useMemo } from "react";
import { motion } from "framer-motion";

// segments: { key, value, color, label?, percent? }[]
// size, strokeWidth, gap, showLegend — optional
const DonutChart = ({
  segments = [],
  size = 110,
  strokeWidth = 16,
  gap = 3,
  centerLabel,
  centerSubLabel = "total",
  showLegend = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = useMemo(
    () => segments.reduce((sum, s) => sum + (s.value ?? 0), 0),
    [segments],
  );

  const arcs = useMemo(() => {
    return segments.reduce(
      (acc, seg) => {
        const fraction = total > 0 ? seg.value / total : 0;
        const dashLength = Math.max(0, fraction * circumference - gap);
        const rotation = -90 + acc.offset * 360;
        return {
          offset: acc.offset + fraction,
          items: [...acc.items, { ...seg, dashLength, rotation }],
        };
      },
      { offset: 0, items: [] },
    ).items;
  }, [segments, total, circumference, gap]);

  const displayCenter = centerLabel ?? total;

  const chart = (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      {/* track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />

      {/* animated segments */}
      {arcs.map((arc, i) => {
        if (arc.value === 0) return null;
        return (
          <motion.circle
            key={arc.key ?? i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={`${arc.dashLength} ${circumference}`}
            transform={`rotate(${arc.rotation}, ${cx}, ${cy})`}
            initial={{ opacity: 0, strokeDasharray: `0 ${circumference}` }}
            animate={{
              opacity: 1,
              strokeDasharray: `${arc.dashLength} ${circumference}`,
            }}
            transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.08 }}
          />
        );
      })}

      {/* center text */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="18"
        fontWeight="bold"
        fill="rgba(255,255,255,0.9)"
      >
        {displayCenter}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="9"
        fill="rgba(255,255,255,0.35)"
      >
        {centerSubLabel}
      </text>
    </svg>
  );

  if (!showLegend) return chart;

  return (
    <div className="flex items-center gap-4">
      {chart}
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ background: seg.color }}
            />
            {seg.label && (
              <span className="secondary text-xs text-chino/70 w-12">
                {seg.label}
              </span>
            )}
            <span className="secondary text-xs font-semibold text-cream">
              {seg.value}
            </span>
            {seg.percent != null && (
              <span className="secondary text-xs text-chino/50">
                {seg.percent}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
