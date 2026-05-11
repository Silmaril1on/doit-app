"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { playSound } from "../../lib/utils/playsound";

const MotionCount = ({
  value,
  count,
  prefix = "",
  text = "",
  size = "md",
  sound = false,
  onComplete,
}) => {
  const numericValue = value ?? count ?? 0;

  const [displayedCount, setDisplayedCount] = useState(0);

  const motionValue = useMotionValue(0);
  // Keep a ref to onComplete so we can call the latest version without
  // adding it to the effect's dependency array (prevents double-animation
  // when the parent re-renders and passes a new inline arrow function).
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  const textSize = sizeClasses[size] || sizeClasses.md;

  useEffect(() => {
    if (sound) {
      playSound("count");
    }

    const controls = animate(motionValue, numericValue, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayedCount(Math.floor(latest));
      },
      onComplete: () => onCompleteRef.current?.(),
    });

    return () => controls.stop();
  }, [numericValue, motionValue, sound]);

  return (
    <div className="flex flex-col items-start text-cream">
      <motion.div
        className={`${textSize}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {prefix}
        {displayedCount.toLocaleString("en-US", {
          useGrouping: false,
        })}
      </motion.div>

      {text && (
        <motion.div
          className="text-xs sm:text-sm text-chino"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {text}
        </motion.div>
      )}
    </div>
  );
};

export default MotionCount;
