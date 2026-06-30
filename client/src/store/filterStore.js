import { create } from 'zustand';

export const useFilterStore = create((set, get) => ({
  search: '',
  location: '',
  type: '',
  source: '',
  remote: false,
  sort: '-postedAt',
  experience: '',
  salaryMin: '',
  salaryMax: '',

  setFilter: (key, value) => set({ [key]: value }),

  setFilters: (filters) => set(filters),

  clearFilters: () =>
    set({
      search: '',
      location: '',
      type: '',
      source: '',
      remote: false,
      sort: '-postedAt',
      experience: '',
      salaryMin: '',
      salaryMax: '',
    }),

  getActiveFilters: () => {
    const state = get();
    const active = {};
    if (state.location) active.location = state.location;
    if (state.type) active.type = state.type;
    if (state.source) active.source = state.source;
    if (state.remote) active.remote = true;
    if (state.sort !== '-postedAt') active.sort = state.sort;
    if (state.experience) active.experience = state.experience;
    return active;
  },

  getActiveCount: () => {
    const state = get();
    let count = 0;
    if (state.location) count++;
    if (state.type) count++;
    if (state.source) count++;
    if (state.remote) count++;
    if (state.experience) count++;
    return count;
  },
}));
