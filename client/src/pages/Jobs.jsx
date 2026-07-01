import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, RefreshCw, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import SearchBar from '@/components/search/SearchBar';
import JobGrid from '@/components/jobs/JobGrid';
import JobFilters from '@/components/jobs/JobFilters';
import JobDetail from '@/components/jobs/JobDetail';
import { Button } from '@/components/ui/button';
import { useJobStore } from '@/store/jobStore';
import { useFilterStore } from '@/store/filterStore';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function Jobs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [scraping, setScraping] = useState(false);

  const { jobs, total, pages, currentPage, loading, selectedJob, fetchJobs, searchJobs, loadMore, triggerScrape, toggleBookmark, setSelectedJob, setPage } = useJobStore();
  const filters = useFilterStore();
  const { isAuthenticated } = useAuth();

  // Fetch jobs on mount and filter change
  useEffect(() => {
    const activeFilters = {
      location: filters.location,
      type: filters.type,
      source: filters.source,
      remote: filters.remote,
      sort: filters.sort,
      experience: filters.experience,
    };

    if (filters.search) {
      searchJobs(filters.search, activeFilters);
    } else {
      fetchJobs(activeFilters);
    }
  }, [filters.location, filters.type, filters.source, filters.remote, filters.sort, filters.experience, filters.search]);

  const handleSearch = (query, location) => {
    if (location) filters.setFilter('location', location);
    filters.setFilter('search', query || '');
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setDetailOpen(true);
  };

  const handleBookmark = async (jobId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to bookmark jobs');
      return;
    }
    try {
      const result = await toggleBookmark(jobId);
      toast.success(result.bookmarked ? 'Job bookmarked!' : 'Bookmark removed');
    } catch {
      toast.error('Failed to bookmark job');
    }
  };

  const handleScrape = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to trigger a scrape');
      return;
    }
    setScraping(true);
    try {
      const result = await triggerScrape(filters.search || 'software engineer', filters.location || 'Bangalore');
      toast.success(result.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Scrape failed');
    } finally {
      setScraping(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const activeFilters = {
      page: newPage,
      location: filters.location,
      type: filters.type,
      source: filters.source,
      remote: filters.remote,
      sort: filters.sort,
    };
    fetchJobs(activeFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="flex-1 order-1 sm:order-2">
              <SearchBar onSearch={handleSearch} />
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-3 order-2 sm:order-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Filters
                {filters.getActiveCount() > 0 && (
                  <span className="ml-1 bg-brand-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {filters.getActiveCount()}
                  </span>
                )}
              </Button>

              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleScrape}
                  disabled={scraping}
                  className="shrink-0"
                >
                  {scraping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span className="ml-1">
                    {scraping ? 'Scraping...' : 'Scrape Fresh'}
                  </span>
                </Button>
              )}
            </div>
          </div>

          {/* Filters bar */}
          <JobFilters total={total} />

          {/* Job Grid */}
          <JobGrid
            jobs={jobs}
            loading={loading}
            onJobClick={handleJobClick}
            onBookmark={handleBookmark}
          />

          {/* Pagination */}
          {pages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-8 pb-8">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                  let page;
                  if (pages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= pages - 2) {
                    page = pages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                          : 'text-muted-foreground hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= pages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Job Detail drawer */}
      <JobDetail
        job={selectedJob}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onBookmark={handleBookmark}
      />
    </div>
  );
}
