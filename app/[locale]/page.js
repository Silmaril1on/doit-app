import React from "react";
import ItemCard from "./components/container/ItemCard";
import MotionCount from "./components/motion/MotionCount";

export const metadata = {
  title: "DoIt — Level Up Your Life",
  description:
    "DoIt helps you set objectives, track achievements, and level up through real-life tasks. Join your friends on the journey.",
};

const fonts = [
  {
    name: "Luckiest Guy",
    family: "'Luckiest Guy', cursive",
    shadow: "5px 6px 7px rgba(0,0,0,0.9)",
  },
];

export default function GamingFontShowcase() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 p-10">
      <MotionCount value={43} prefix="+" />
    </div>
  );
}
