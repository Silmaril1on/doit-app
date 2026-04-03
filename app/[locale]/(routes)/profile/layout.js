import Link from "next/link";
import React from "react";

const userProfileLayout = ({ children }) => {
  return (
    <div className="bg-black">
      <div className="bg-black flex gap-3 px-3">
        <Link href="/profile/basic-information" className="text-teal-500">
          My Profile
        </Link>
        <Link href="/profile/security" className="text-teal-500">
          Security
        </Link>
        <Link href="/profile/my-achievements" className="text-teal-500">
          My Achievements
        </Link>
        <Link href="/profile/statistics" className="text-teal-500">
          Statistics
        </Link>
      </div>
      {children}
    </div>
  );
};

export default userProfileLayout;
