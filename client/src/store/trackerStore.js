import { create } from 'zustand';
import api from '../lib/axios';

export const useTrackerStore = create((set, get) => ({
  applications: [],
  isLoading: false,
  error: null,

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/tracker');
      set({ applications: data, isLoading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch applications';
      set({ error: message, isLoading: false });
    }
  },

  addApplication: async (appData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/tracker', appData);
      set((state) => ({
        applications: [...state.applications, data],
        isLoading: false,
      }));
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create application';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateStatus: async (id, status) => {
    // Optimistic update
    const previousApps = get().applications;
    set((state) => ({
      applications: state.applications.map((app) =>
        app._id === id ? { ...app, status } : app
      ),
    }));

    try {
      const { data } = await api.patch(`/tracker/${id}/status`, { status });
      return data;
    } catch (err) {
      // Rollback on error
      set({ applications: previousApps });
      const message = err.response?.data?.message || 'Failed to update application status';
      throw new Error(message);
    }
  },

  updateDetails: async (id, details) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/tracker/${id}`, details);
      set((state) => ({
        applications: state.applications.map((app) =>
          app._id === id ? data : app
        ),
        isLoading: false,
      }));
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update application details';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteApplication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/tracker/${id}`);
      set((state) => ({
        applications: state.applications.filter((app) => app._id !== id),
        isLoading: false,
      }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete application';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
}));
