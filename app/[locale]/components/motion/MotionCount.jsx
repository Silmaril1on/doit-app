"use client";
import { useEffect, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";

const MotionCount = ({
  value = 0,
  duration = 0.6,
  prefix = "",
  suffix = "",
  className = "",
}) => {
  const [display, setDisplay] = useState(0);
  const count = useMotionValue(0);

  useMotionValueEvent(count, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  useEffect(() => {
    const target = Number.isFinite(Number(value)) ? Number(value) : 0;
    const controls = animate(count, target, {
      duration,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, duration, count]);

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

export default MotionCount;
