import Link from "next/link";
import React from "react";

const SettingsPage = () => {
  return (
    <div className="page-wrapper center flex-col *:text-6xl *:font-bold gap-3">
      <Link href="/game-settings/security" className="text-teal-500">
        Security
      </Link>
      <Link href="/game-settings/achievements" className="text-teal-500">
        Achievements
      </Link>
      <Link href="/game-settings/statistics" className="text-teal-500">
        Statistics
      </Link>
      <Link href="/game-settings/customization" className="text-teal-500">
        Customization
      </Link>
    </div>
  );
};

export default SettingsPage;
