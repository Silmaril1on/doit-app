import { Suspense } from "react";

export const metadata = {
  title: "Achievements — DoIt",
  description: "View your earned badges and level milestones.",
};

export default function AchievementsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-cream mb-8">Achievements</h1>

      <Suspense fallback={<div>Loading badges...</div>}>
        {/* Parallel slots will render here via layout.js */}
      </Suspense>
    </div>
  );
}
