import { useMemo, useState } from "react";
import { FaUser } from "react-icons/fa";
import Image from "next/image";

const ImageTag = ({
  src,
  alt = "Image",
  width = 80,
  height = 80,
  fill = false,
  sizes,
  priority = false,
  quality = 85,
  containerClassName = "",
  imageClassName = "",
  fallbackSrc,
  fallbackIcon,
  onClick,
  unoptimized,
  rounded = true,
  objectFit = "cover",
  children,
}) => {
  const [failedSrc, setFailedSrc] = useState(null);

  const normalizedSrc = src || null;
  const resolvedSrc =
    normalizedSrc && normalizedSrc !== failedSrc
      ? normalizedSrc
      : fallbackSrc || null;

  const shouldUseUnoptimized = useMemo(() => {
    if (typeof unoptimized === "boolean") return unoptimized;
    return typeof resolvedSrc === "string" && resolvedSrc.startsWith("blob:");
  }, [resolvedSrc, unoptimized]);

  const computedSizes = sizes || (fill ? "100vw" : `${width}px`);

  const containerClasses = [
    "relative overflow-hidden",
    rounded ? "rounded-md" : "",
    onClick ? "cursor-pointer" : "",
    containerClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const imgClasses = [
    objectFit === "contain" ? "object-contain" : "object-cover",
    imageClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const style = fill ? undefined : { width, height };

  return (
    <div className={containerClasses} style={style} onClick={onClick}>
      {resolvedSrc ? (
        <Image
          src={resolvedSrc}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          sizes={computedSizes}
          priority={priority}
          quality={quality}
          unoptimized={shouldUseUnoptimized}
          className={imgClasses}
          onError={() => setFailedSrc(resolvedSrc)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/50 text-teal-500/40">
          {fallbackIcon || (
            <FaUser size={Math.max(18, Math.floor(width / 3))} />
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default ImageTag;
