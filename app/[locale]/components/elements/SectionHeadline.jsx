import React from "react";

const SectionHeadline = ({ title, subtitle }) => {
  return (
    <div className="*:leading-none ">
      <h1 className="text-teal-500 capitalize text-2xl lg:text-4xl font-bold">
        {title}
      </h1>
      <p className="secondary text-chino text-xs">{subtitle}</p>
    </div>
  );
};

export default SectionHeadline;
