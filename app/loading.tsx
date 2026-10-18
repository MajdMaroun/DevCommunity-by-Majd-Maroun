// app/loading.tsx
// Shown instantly while a page's data loads. With Cache Components this file is also
// the Suspense boundary that lets pages which read the database or session build.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-8" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-800" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-800/70" />

      <div className="grid gap-4 pt-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-xl border border-slate-800 bg-[#0f1629]"
          />
        ))}
      </div>
    </div>
  );
}