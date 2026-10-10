export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-1/3 animate-pulse rounded bg-surface-2" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-2" />
        ))}
      </div>
    </div>
  );
}
