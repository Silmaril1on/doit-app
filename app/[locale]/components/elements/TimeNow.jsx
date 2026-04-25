"use client";
import { useSelector } from "react-redux";
import { selectColorValue } from "@/app/[locale]/lib/features/configSlice";
import { THEME } from "@/app/[locale]/lib/utils/themeClasses";
import { timeAgo } from "@/app/[locale]/lib/utils/utils";

const TimeNow = ({ date, className = "" }) => {
  const colorTheme = useSelector(selectColorValue) ?? "teal";
  const t = THEME[colorTheme] ?? THEME.teal;

  return (
    <span className={`${t.progressText} opacity-60 ${className}`}>
      {timeAgo(date)}
    </span>
  );
};

export default TimeNow;
