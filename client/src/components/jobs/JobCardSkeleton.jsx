export default function JobCardSkeleton() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-white/5" />
        <div className="flex-1">
          <div className="h-3 w-24 bg-white/5 rounded mb-2" />
          <div className="h-3 w-16 bg-white/5 rounded" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5" />
      </div>
      <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
      <div className="h-3 w-full bg-white/5 rounded mb-1" />
      <div className="h-3 w-2/3 bg-white/5 rounded mb-4" />
      <div className="flex gap-2 mb-3">
        <div className="h-4 w-20 bg-white/5 rounded" />
        <div className="h-4 w-16 bg-white/5 rounded" />
        <div className="h-4 w-14 bg-white/5 rounded" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-16 bg-white/5 rounded-full" />
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-surface-border flex justify-between">
        <div className="h-3 w-24 bg-white/5 rounded" />
        <div className="h-3 w-8 bg-white/5 rounded" />
      </div>
    </div>
  );
}
