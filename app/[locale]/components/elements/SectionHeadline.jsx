"use client";

const SectionHeadline = ({ title, subtitle }) => {
  return (
    <div className="*:leading-none ">
      <h1 className="text-primary  text-2xl lg:text-4xl tracking-[1px]">
        {title}
      </h1>
      <p className="secondary text-chino text-xs">{subtitle}</p>
    </div>
  );
};

export default SectionHeadline;
