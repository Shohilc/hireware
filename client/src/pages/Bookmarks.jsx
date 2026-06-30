import { motion } from 'framer-motion';
import { BookmarkCheck } from 'lucide-react';
import JobGrid from '@/components/jobs/JobGrid';
import JobDetail from '@/components/jobs/JobDetail';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useJobStore } from '@/store/jobStore';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Bookmarks() {
  const { bookmarks, loading, toggleBookmark: toggleBk } = useBookmarks();
  const { selectedJob, setSelectedJob } = useJobStore();
  const [detailOpen, setDetailOpen] = useState(false);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setDetailOpen(true);
  };

  const handleBookmark = async (jobId) => {
    try {
      const result = await toggleBk(jobId);
      toast.success(result.bookmarked ? 'Job bookmarked!' : 'Bookmark removed');
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-display font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-brand-400" />
            Saved Jobs
          </h1>
          <p className="text-muted-foreground text-sm">
            {bookmarks?.length || 0} bookmarked jobs
          </p>
        </motion.div>

        <JobGrid
          jobs={bookmarks?.map((j) => ({ ...j, isBookmarked: true })) || []}
          loading={loading}
          onJobClick={handleJobClick}
          onBookmark={handleBookmark}
        />

        <JobDetail
          job={selectedJob}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          onBookmark={handleBookmark}
        />
      </div>
    </div>
  );
}
