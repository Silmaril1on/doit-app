"use client";

/**
 * Renders an icon with the active theme accent color.
 * @param {React.ReactNode} icon - The icon element to render.
 * @param {string} [className] - Optional extra class names.
 */
const IconTag = ({ icon, className = "" }) => {
  return <span className={`text-primary ${className}`}>{icon}</span>;
};

export default IconTag;
