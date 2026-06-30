import { useEffect } from 'react';
import { useJobStore } from '../store/jobStore';
import { useFilterStore } from '../store/filterStore';

export function useJobs() {
  const { jobs, total, pages, currentPage, loading, error, fetchJobs, searchJobs, loadMore, triggerScrape, toggleBookmark } = useJobStore();
  const filters = useFilterStore();

  useEffect(() => {
    const activeFilters = filters.getActiveFilters();
    if (filters.search) {
      searchJobs(filters.search);
    } else {
      fetchJobs(activeFilters);
    }
  }, [filters.location, filters.type, filters.source, filters.remote, filters.sort, filters.experience]);

  const refresh = () => {
    const activeFilters = filters.getActiveFilters();
    if (filters.search) {
      searchJobs(filters.search);
    } else {
      fetchJobs(activeFilters);
    }
  };

  return {
    jobs,
    total,
    pages,
    currentPage,
    loading,
    error,
    refresh,
    loadMore,
    triggerScrape,
    toggleBookmark,
  };
}
