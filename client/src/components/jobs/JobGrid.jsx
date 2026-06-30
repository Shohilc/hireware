import { AnimatePresence } from 'framer-motion';
import JobCard from './JobCard';
import JobCardSkeleton from './JobCardSkeleton';

export default function JobGrid({ jobs, loading, onJobClick, onBookmark }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!jobs?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No jobs found</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Try adjusting your filters or search query to find more opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <AnimatePresence mode="popLayout">
        {jobs.map((job, index) => (
          <JobCard
            key={job._id || job.slug || index}
            job={job}
            index={index}
            onClick={onJobClick}
            onBookmark={onBookmark}
            isBookmarked={job.isBookmarked}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
