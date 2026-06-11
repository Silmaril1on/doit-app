/**
 * ProfileSkeletons — shape-preserving loading states.
 * Used as Suspense fallbacks so there is zero layout shift.
 *
 * These are plain React (no hooks/state), safe to import from client components.
 */

const Pulse = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-white/8 ${className}`} />
);

// ─── Analytics section skeleton (Badges + Stats) ─────────────────────────────
export const AnalyticsSkeleton = () => (
  <div className="space-y-5 w-full">
    {/* Badges skeleton */}
    <div className="rounded-xl border border-primary/10 bg-black/30 p-4 space-y-3">
      <Pulse className="h-7 w-28" />
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-xl border border-primary/10 bg-primary/5 p-4 w-24"
          >
            <Pulse className="h-12 w-12 rounded-full" />
            <Pulse className="h-3 w-16" />
            <Pulse className="h-2 w-12" />
          </div>
        ))}
      </div>
    </div>

    {/* Stats skeleton */}
    <div className="rounded-xl border border-primary/10 bg-black/30 p-4 grid grid-cols-2 gap-x-6 gap-y-2">
      {[0, 1].map((col) => (
        <div key={col} className="space-y-4">
          <Pulse className="h-3 w-20" />
          {[0, 1, 2].map((row) => (
            <div key={row} className="space-y-1">
              <div className="flex justify-between">
                <Pulse className="h-2.5 w-14" />
                <Pulse className="h-2.5 w-6" />
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Pulse key={i} className="h-1.5 flex-1 rounded-sm" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ─── Gallery skeleton ─────────────────────────────────────────────────────────
export const GallerySkeleton = () => (
  <div className="rounded-xl border border-primary/10 bg-black/30 p-4 space-y-4">
    <div className="flex justify-between items-center">
      <Pulse className="h-7 w-24" />
      <Pulse className="h-4 w-12" />
    </div>
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="flex-none w-76 rounded-2xl border border-primary/10 bg-black/40 overflow-hidden"
        >
          <Pulse className="w-full h-48 rounded-none" />
          <div className="p-4 space-y-2">
            <Pulse className="h-4 w-3/4" />
            <Pulse className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
