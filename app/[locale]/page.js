"use client";

import React, { useState } from "react";
import MotionCount from "./components/motion/MotionCount";
import HomePage from "./layout/homepage/HomePage";

export default function GamingFontShowcase() {
  const [key, setKey] = useState(0);
  const [show, setShow] = useState(false);

  const handleTrigger = () => {
    setKey((k) => k + 1); // remount MotionCount so animation + sound replay
    setShow(true);
  };

  return (
    <div className="page-wrapper flex flex-col items-center justify-center gap-8 p-10">
      {/* <button className="text-primary" onClick={handleTrigger}>
        Trigger
      </button>

      {show && (
        <MotionCount
          key={key}
          value={43}
          prefix="+"
          sound={true}
          text="xp earned"
        />
      )} */}
      <HomePage />
    </div>
  );
}
