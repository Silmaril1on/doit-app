"use client";

import React, { useState } from "react";
import MotionCount from "./components/motion/MotionCount";
import HomePage from "./layout/homepage/HomePage";

export default function GamingFontShowcase() {
  const [key, setKey] = useState(0);
  const [show, setShow] = useState(false);

  const handleTrigger = () => {
    setKey((k) => k + 1);
    setShow(true);
  };

  return (
    <div className="">
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
