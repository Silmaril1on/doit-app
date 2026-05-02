import Image from "next/image";

const ImageTag = ({
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

  // Callers should always pass an explicit `sizes` for fill images.
  // Falling back to "100vw" would cause Next.js to serve a full-viewport-width
  // image for every avatar/thumbnail — always pass the real rendered size.
  const computedSizes = sizes ?? (fill ? undefined : `${width || 100}px`);

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

export default ImageTag;
