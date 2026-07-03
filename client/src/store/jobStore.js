import { create } from 'zustand';
import api from '../lib/axios';

// --- Client-side search and filtering helpers for scraped jobs in LocalStorage ---

function matchSearchQuery(job, query) {
  if (!query) return true;
  const searchWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (searchWords.length === 0) return true;
  
  const titleL = job.title?.toLowerCase() || '';
  const compL = job.company?.toLowerCase() || '';
  const descL = job.description?.toLowerCase() || '';
  const tagsL = job.tags?.map(t => t.toLowerCase()) || [];
  
  return searchWords.every(word =>
    titleL.includes(word) ||
    compL.includes(word) ||
    descL.includes(word) ||
    tagsL.some(t => t.includes(word))
  );
}

function matchExperience(jobExpText, filterExp) {
  if (!filterExp) return true;
  if (!jobExpText) return false;
  
  const filter = filterExp.toLowerCase();
  const jobExp = jobExpText.toLowerCase();

  if (filter.includes('fresher')) {
    return jobExp.includes('fresher') || jobExp.includes('0 yr') || jobExp.startsWith('0-') || jobExp.includes('0 to');
  }

  let filterMin = 0, filterMax = 100;
  if (filter.includes('10+')) {
    filterMin = 10;
  } else {
    const match = filter.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      filterMin = parseInt(match[1], 10);
      filterMax = parseInt(match[2], 10);
    }
  }

  let jobMin = 0, jobMax = 0;
  const rangeMatch = jobExp.match(/(\d+)\s*(-|to)\s*(\d+)/);
  if (rangeMatch) {
    jobMin = parseInt(rangeMatch[1], 10);
    jobMax = parseInt(rangeMatch[3], 10);
  } else {
    const singleMatch = jobExp.match(/(\d+)/);
    if (singleMatch) {
      jobMin = parseInt(singleMatch[1], 10);
      jobMax = jobMin;
    }
  }

  return Math.max(filterMin, jobMin) <= Math.min(filterMax, jobMax);
}

function matchLocation(jobLoc, filterLoc) {
  if (!filterLoc) return true;
  if (!jobLoc) return false;
  
  const fLoc = filterLoc.toLowerCase();
  const jLoc = jobLoc.toLowerCase();
  
  if (fLoc === 'remote') {
    return jLoc.includes('remote');
  }
  
  return jLoc.includes(fLoc) || fLoc.includes(jLoc);
}

function filterJobsList(jobs, query, filters) {
  return jobs.filter((j) => {
    // 1. Search Query
    if (query && !matchSearchQuery(j, query)) return false;
    
    // 2. Location
    if (filters.location && !matchLocation(j.location, filters.location)) return false;
    
    // 3. Job Type
    if (filters.type && j.type?.toLowerCase() !== filters.type.toLowerCase()) return false;
    
    // 4. Source Platform
    if (filters.source && j.source?.toLowerCase() !== filters.source.toLowerCase()) return false;
    
    // 5. Remote Only
    if (filters.remote && !j.remote && !j.location?.toLowerCase().includes('remote')) return false;
    
    // 6. Experience
    if (filters.experience && !matchExperience(j.experience, filters.experience)) return false;
    
    return true;
  });
}

// --- Zustand Store ---

export const useJobStore = create((set, get) => {
  let initialScraped = [];
  try {
    const saved = localStorage.getItem('scrapedJobs');
    if (saved) initialScraped = JSON.parse(saved);
  } catch {}

  return {
    jobs: [],
    scrapedJobs: initialScraped,
    total: 0,
    pages: 0,
    currentPage: 1,
    loading: false,
    error: null,
    selectedJob: null,

    fetchJobs: async (filters = {}) => {
      set({ loading: true, error: null });
      try {
        const { currentPage, scrapedJobs } = get();
        const params = new URLSearchParams();
        params.set('page', filters.page || currentPage);
        params.set('limit', filters.limit || 20);
        if (filters.location) params.set('location', filters.location);
        if (filters.type) params.set('type', filters.type);
        if (filters.source) params.set('source', filters.source);
        if (filters.remote) params.set('remote', 'true');
        if (filters.sort) params.set('sort', filters.sort);
        if (filters.experience) params.set('experience', filters.experience);

        const { data } = await api.get(`/jobs?${params}`);
        
        let mergedJobs = [...data.jobs];
        const seen = new Set(mergedJobs.map((j) => j.sourceUrl));

        const filteredScraped = filterJobsList(scrapedJobs, '', filters);

        for (const j of filteredScraped) {
          if (j.sourceUrl && !seen.has(j.sourceUrl)) {
            seen.add(j.sourceUrl);
            mergedJobs.push(j);
          }
        }

        if (filters.sort === '-postedAt') {
          mergedJobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
        } else if (filters.sort === 'postedAt') {
          mergedJobs.sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt));
        } else if (filters.sort === '-views') {
          mergedJobs.sort((a, b) => (b.views || 0) - (a.views || 0));
        }

        set({
          jobs: mergedJobs,
          total: mergedJobs.length,
          pages: Math.ceil(mergedJobs.length / (filters.limit || 20)),
          currentPage: data.page,
          loading: false,
        });
        return data;
      } catch (err) {
        set({ error: err.message, loading: false });
      }
    },

    searchJobs: async (query, filters = {}) => {
      set({ loading: true, error: null });
      try {
        const { scrapedJobs } = get();
        const params = new URLSearchParams();
        params.set('q', query);
        params.set('page', filters.page || 1);
        params.set('limit', filters.limit || 20);
        if (filters.location) params.set('location', filters.location);
        if (filters.type) params.set('type', filters.type);
        if (filters.source) params.set('source', filters.source);
        if (filters.remote) params.set('remote', 'true');
        if (filters.experience) params.set('experience', filters.experience);

        const { data } = await api.get(`/jobs/search?${params}`);
        
        let mergedJobs = [...data.jobs];
        const seen = new Set(mergedJobs.map((j) => j.sourceUrl));

        const filteredScraped = filterJobsList(scrapedJobs, query, filters);

        for (const j of filteredScraped) {
          if (j.sourceUrl && !seen.has(j.sourceUrl)) {
            seen.add(j.sourceUrl);
            mergedJobs.push(j);
          }
        }

        set({
          jobs: mergedJobs,
          total: mergedJobs.length,
          pages: Math.ceil(mergedJobs.length / (filters.limit || 20)),
          currentPage: data.page,
          loading: false,
        });
        return data;
      } catch (err) {
        set({ error: err.message, loading: false });
      }
    },

    loadMore: async (filters = {}) => {
      const { currentPage, jobs } = get();
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage + 1);
        params.set('limit', 20);
        Object.entries(filters).forEach(([k, v]) => {
          if (v) params.set(k, v);
        });

        const { data } = await api.get(`/jobs?${params}`);
        set({
          jobs: [...jobs, ...data.jobs],
          total: data.total,
          pages: data.pages,
          currentPage: data.page,
        });
      } catch (err) {
        set({ error: err.message });
      }
    },

    setSelectedJob: (job) => set({ selectedJob: job }),

    fetchJobBySlug: async (slug) => {
      try {
        const { data } = await api.get(`/jobs/${slug}`);
        set({ selectedJob: data });
        return data;
      } catch (err) {
        set({ error: err.message });
      }
    },

    triggerScrape: async (query, location, activeFilters = {}) => {
      const { data } = await api.post('/jobs/scrape', { query, location });
      const newJobs = data.jobs || [];
      const currentScraped = get().scrapedJobs || [];
      
      const merged = [...newJobs, ...currentScraped];
      const unique = [];
      const seen = new Set();
      for (const j of merged) {
        if (j.sourceUrl && !seen.has(j.sourceUrl)) {
          seen.add(j.sourceUrl);
          unique.push(j);
        }
      }
      
      set({ scrapedJobs: unique });
      localStorage.setItem('scrapedJobs', JSON.stringify(unique));
      
      if (query && query !== 'software engineer') {
        await get().searchJobs(query, activeFilters);
      } else {
        await get().fetchJobs(activeFilters);
      }
      return data;
    },

    toggleBookmark: async (jobId) => {
      try {
        const { data } = await api.post(`/jobs/${jobId}/bookmark`);
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j._id === jobId ? { ...j, isBookmarked: data.bookmarked } : j
          ),
          selectedJob:
            state.selectedJob?._id === jobId
              ? { ...state.selectedJob, isBookmarked: data.bookmarked }
              : state.selectedJob,
        }));
        return data;
      } catch (err) {
        throw err;
      }
    },

    setPage: (page) => set({ currentPage: page }),

    reset: () => {
      localStorage.removeItem('scrapedJobs');
      set({
        jobs: [],
        scrapedJobs: [],
        total: 0,
        pages: 0,
        currentPage: 1,
        loading: false,
        error: null,
        selectedJob: null,
      });
    },
  };
});
