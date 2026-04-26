"use client";
import { timeAgo } from "@/app/[locale]/lib/utils/utils";

const TimeNow = ({ date, className = "" }) => {
  return (
    <span className={`text-primary opacity-60 ${className}`}>
      {timeAgo(date)}
    </span>
  );
};

export default TimeNow;
