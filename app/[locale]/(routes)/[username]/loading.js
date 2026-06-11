/**
 * Route-level loading skeleton — shown while the server component resolves.
 * Mirrors the visual weight of the profile header so there is no layout shift.
 */

const Pulse = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-white/8 ${className}`} />
);

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col space-y-5 px-4 pb-19 pt-17 bg-black">
      {/* Header chips */}
      <div className="flex items-center justify-end gap-3 mt-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-7 w-18 rounded-xl" />
        ))}
      </div>

      {/* Avatar section */}
      <div className="relative h-44">
        <Pulse className="absolute right-0 w-[85%] h-44 rounded-xl" />
        <Pulse className="absolute left-0 top-2 h-24 w-32 rounded-xl z-10" />
      </div>

      {/* Profile info card */}
      <div className="rounded-xl border border-primary/10 bg-black/30 p-4 space-y-3">
        <Pulse className="h-7 w-44" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-primary/10 bg-black/50 p-3 space-y-1.5"
            >
              <Pulse className="h-2.5 w-16" />
              <Pulse className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
