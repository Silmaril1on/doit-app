import ImageTag from "@/app/[locale]/components/elements/ImageTag";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-20 w-20 text-base",
};

const AvatarTag = ({
  user,
  imageUrl,
  displayName,
  firstName,
  lastName,
  initials,
  label,
  size = "md",
  className = "",
}) => {
  // Resolve values — user object takes precedence over individual props
  const resolvedImage = user?.image_url ?? imageUrl;
  const resolvedFirst = user?.first_name ?? firstName;
  const resolvedLast = user?.last_name ?? lastName;
  const resolvedDisplay = user?.display_name ?? displayName;

  const fullName = [resolvedFirst, resolvedLast].filter(Boolean).join(" ");
  const altText = fullName || resolvedDisplay || "user";

  const resolvedInitials =
    initials ??
    (resolvedFirst || resolvedLast
      ? [resolvedFirst, resolvedLast]
          .filter(Boolean)
          .map((n) => n[0].toUpperCase())
          .join("")
      : (resolvedDisplay?.[0]?.toUpperCase() ?? "?"));

  const sizeClasses = sizes[size] ?? sizes.md;

  const resolvedLabel =
    label === true ? fullName || resolvedDisplay || null : label || null;

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`relative shrink-0 overflow-hidden rounded-md border border-teal-500/30 bg-black/40 ${sizeClasses}`}
      >
        {resolvedImage ? (
          <ImageTag
            src={resolvedImage}
            alt={altText}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold text-teal-400">
            {resolvedInitials}
          </div>
        )}
      </div>
      {resolvedLabel && (
        <p className="text-xs font-semibold text-cream secondary capitalize text-center leading-tight">
          {resolvedLabel}
        </p>
      )}
    </div>
  );
};

export default AvatarTag;
