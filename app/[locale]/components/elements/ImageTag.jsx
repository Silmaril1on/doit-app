import Image from "next/image";

const AppImage = ({
  src,
  alt = "",
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  quality = 85,
  className = "",
  style,
  unoptimized,
  ...props
}) => {
  if (!src) return null;

  const computedSizes = sizes || (fill ? "100vw" : `${width || 100}px`);

  const shouldUnoptimize =
    typeof unoptimized === "boolean"
      ? unoptimized
      : typeof src === "string" && src.startsWith("blob:");

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={computedSizes}
      priority={priority}
      quality={quality}
      unoptimized={shouldUnoptimize}
      className={className}
      style={style}
      {...props}
    />
  );
};

export default AppImage;
