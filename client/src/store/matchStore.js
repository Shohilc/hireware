import { create } from 'zustand';
import api from '../lib/axios';

export const useMatchStore = create((set) => ({
  matchResult: null,
  isLoading: false,
  error: null,

  analyzeResume: async (resumeText, jobDescription, jobId) => {
    set({ isLoading: true, error: null, matchResult: null });
    try {
      const payload = { resumeText };
      if (jobId) {
        payload.jobId = jobId;
      } else {
        payload.jobDescription = jobDescription;
      }

      const { data } = await api.post('/match', payload);
      set({ matchResult: data, isLoading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to analyze resume';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  clearResult: () => set({ matchResult: null, error: null }),
}));
