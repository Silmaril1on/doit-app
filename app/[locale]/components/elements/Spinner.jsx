/**
 * Spinner component.
 *
 * variant="default"  — small inline spinner (border-spin), used in buttons etc.
 * variant="loading"  — full-page dual-ring loader, used in loading.js files.
 */
const Spinner = ({ size = 14, variant = "default" }) => {
  if (variant === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <span className="relative flex h-12 w-12">
          {/* Static track */}
          <span className="absolute inset-0 rounded-full border-2 border-primary/15" />
          {/* Spinning arc */}
          <span className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent border-r-transparent animate-spin" />
          {/* Inner pulse dot */}
          <span className="absolute inset-[11px] rounded-full bg-primary/30 animate-pulse" />
        </span>
      </div>
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className="inline-block shrink-0 rounded-full border-2 border-primary border-t-transparent animate-spin"
    />
  );
};

export default Spinner;
