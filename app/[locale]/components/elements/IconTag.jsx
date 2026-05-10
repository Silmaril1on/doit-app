"use client";

const IconTag = ({ icon, className = "" }) => {
  return <span className={`text-primary ${className}`}>{icon}</span>;
};

export default IconTag;
