import React from "react";

export const metadata = {
  title: "DoIt — Level Up Your Life",
  description:
    "DoIt helps you set objectives, track achievements, and level up through real-life tasks. Join your friends on the journey.",
};

const styles = [
  {
    name: "Classic Arcade",
    className: "[text-shadow:2px_2px_0_black]",
  },
  {
    name: "Double Shadow",
    className: "[text-shadow:2px_2px_0_black,4px_4px_0_black]",
  },
  {
    name: "Neon Glow",
    className: "[text-shadow:0_0_8px_cyan]",
  },
  {
    name: "Heavy 3D",
    className: "[text-shadow:3px_3px_0_black,6px_6px_0_rgba(0,0,0,0.6)]",
  },
  {
    name: "Outline HUD",
    className:
      "[text-shadow:-1px_-1px_0_black,1px_-1px_0_black,-1px_1px_0_black,1px_1px_0_black]",
  },
  {
    name: "Glow + Shadow Mix",
    className: "[text-shadow:0_0_10px_black,2px_2px_0_black]",
  },
];

export default function GamingFontShowcase() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-10 p-10">
      <h1 className="text-4xl font-bold mb-10">Gaming Font Shadow Showcase</h1>

      <div className="grid gap-6 w-full max-w-2xl">
        {styles.map((style) => (
          <div
            key={style.name}
            className="bg-blue-500 p-6 rounded-lg flex flex-col items-center gap-2"
          >
            <span className="text-sm opacity-80">{style.name}</span>

            <h2 className={`text-3xl font-bold text-cream ${style.className}`}>
              This is gaming font
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
