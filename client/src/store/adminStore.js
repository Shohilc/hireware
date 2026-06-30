import { create } from 'zustand';
import api from '../lib/axios';

export const useAdminStore = create((set) => ({
  diagnostics: null,
  scraperMetrics: null,
  users: [],
  isLoading: false,
  error: null,

  fetchDiagnostics: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/admin/diagnostics');
      set({ diagnostics: data, isLoading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch system diagnostics';
      set({ error: message, isLoading: false });
    }
  },

  fetchScraperMetrics: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/admin/scrapers');
      set({ scraperMetrics: data, isLoading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch scraper metrics';
      set({ error: message, isLoading: false });
    }
  },

  fetchUsersList: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/admin/users');
      set({ users: data, isLoading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch users list';
      set({ error: message, isLoading: false });
    }
  },
}));
