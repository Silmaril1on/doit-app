"use client";

const SectionHeadline = ({ title, subtitle }) => {
  return (
    <div className="*:leading-none ">
      <h1 className="text-primary capitalize text-2xl lg:text-4xl font-bold">
        {title}
      </h1>
      <p className="secondary text-chino text-xs">{subtitle}</p>
    </div>
  );
};

export default SectionHeadline;
