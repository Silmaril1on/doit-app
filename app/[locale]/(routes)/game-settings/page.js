import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Settings — DoIt",
  description: "Manage your DoIt account settings.",
};

const SettingsPage = () => {
  return (
    <div className="page-wrapper center flex-col *:text-6xl  gap-3">
      <Link
        href="/game-settings/achievements"
        className="text-primary/80 hover:text-primary duration-300"
      >
        Achievements
      </Link>

      <Link
        href="/game-settings/customization"
        className="text-primary/80 hover:text-primary duration-300"
      >
        Customization
      </Link>
      <Link
        href="/game-settings/difficulty"
        className="text-primary/80 hover:text-primary duration-300"
      >
        Difficulty
      </Link>
      <Link
        href="/game-settings/statistics"
        className="text-primary/80 hover:text-primary duration-300"
      >
        Statistics
      </Link>

      <Link
        href="/game-settings/security"
        className="text-primary/80 hover:text-primary duration-300"
      >
        Security
      </Link>
    </div>
  );
};

export default SettingsPage;
