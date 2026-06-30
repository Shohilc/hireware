import { create } from 'zustand';
import api from '../lib/axios';

export const useJobStore = create((set, get) => ({
  jobs: [],
  total: 0,
  pages: 0,
  currentPage: 1,
  loading: false,
  error: null,
  selectedJob: null,

  fetchJobs: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const { currentPage } = get();
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
      set({
        jobs: data.jobs,
        total: data.total,
        pages: data.pages,
        currentPage: data.page,
        loading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  searchJobs: async (query, page = 1) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/jobs/search?q=${encodeURIComponent(query)}&page=${page}`);
      set({
        jobs: data.jobs,
        total: data.total,
        pages: data.pages,
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
    await get().fetchJobs();
    return data;
  },

  toggleBookmark: async (jobId) => {
    try {
      const { data } = await api.post(`/jobs/${jobId}/bookmark`);
      // Update the bookmark state in the jobs array
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

  reset: () =>
    set({
      jobs: [],
      total: 0,
      pages: 0,
      currentPage: 1,
      loading: false,
      error: null,
      selectedJob: null,
    }),
}));
