import { create } from 'zustand';
import api from '../lib/axios';

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

        let filteredScraped = [...scrapedJobs];
        if (filters.location) {
          const loc = filters.location.toLowerCase();
          filteredScraped = filteredScraped.filter((j) =>
            j.location?.toLowerCase().includes(loc)
          );
        }
        if (filters.type) {
          filteredScraped = filteredScraped.filter((j) =>
            j.type?.toLowerCase() === filters.type.toLowerCase()
          );
        }
        if (filters.source) {
          filteredScraped = filteredScraped.filter((j) =>
            j.source?.toLowerCase() === filters.source.toLowerCase()
          );
        }
        if (filters.remote) {
          filteredScraped = filteredScraped.filter((j) => j.remote);
        }
        if (filters.experience) {
          const exp = filters.experience.toLowerCase();
          filteredScraped = filteredScraped.filter((j) =>
            j.experience?.toLowerCase().includes(exp)
          );
        }

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

        let filteredScraped = [...scrapedJobs];
        if (query) {
          const q = query.toLowerCase();
          filteredScraped = filteredScraped.filter((j) =>
            j.title?.toLowerCase().includes(q) ||
            j.company?.toLowerCase().includes(q) ||
            j.description?.toLowerCase().includes(q) ||
            j.tags?.some((t) => t.toLowerCase().includes(q))
          );
        }
        if (filters.location) {
          const loc = filters.location.toLowerCase();
          filteredScraped = filteredScraped.filter((j) =>
            j.location?.toLowerCase().includes(loc)
          );
        }
        if (filters.type) {
          filteredScraped = filteredScraped.filter((j) =>
            j.type?.toLowerCase() === filters.type.toLowerCase()
          );
        }
        if (filters.source) {
          filteredScraped = filteredScraped.filter((j) =>
            j.source?.toLowerCase() === filters.source.toLowerCase()
          );
        }
        if (filters.remote) {
          filteredScraped = filteredScraped.filter((j) => j.remote);
        }
        if (filters.experience) {
          const exp = filters.experience.toLowerCase();
          filteredScraped = filteredScraped.filter((j) =>
            j.experience?.toLowerCase().includes(exp)
          );
        }

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

    triggerScrape: async (query, location) => {
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
      
      await get().fetchJobs();
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
