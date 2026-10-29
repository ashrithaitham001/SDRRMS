import api from './api';

export const disasterService = {
  getAllDisasters: async (params = {}) => {
    return api.get('/disasters', { params });
  },
  getDisasterById: async (id) => {
    return api.get(`/disasters/${id}`);
  },
  createDisaster: async (data) => {
    return api.post('/disasters', data);
  },
  updateDisaster: async (id, data) => {
    return api.put(`/disasters/${id}`, data);
  },
  deleteDisaster: async (id) => {
    return api.delete(`/disasters/${id}`);
  },
  getActiveDisasters: async () => {
    return api.get('/disasters/active');
  },
  getPublicActiveDisasters: async () => {
    return api.get('/public/active-disasters');
  },
};
