// Lightweight shimmer skeleton blocks for loading states.
// Usage: <Skeleton className="h-6 w-40" /> or <SkeletonCard />
export function Skeleton({ className = '' }) {
  return <div className={`grid-skeleton rounded-lg ${className}`} aria-hidden="true" />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${className}`}>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-7 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export default Skeleton
