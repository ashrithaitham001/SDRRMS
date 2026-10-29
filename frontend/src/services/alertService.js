import api from './api';

export const alertService = {
  getAllAlerts: async (params = {}) => {
    return api.get('/alerts', { params });
  },
  getAlertById: async (id) => {
    return api.get(`/alerts/${id}`);
  },
  publishAlert: async (data) => {
    return api.post('/alerts', data);
  },
  updateStatus: async (id, status) => {
    return api.put(`/alerts/${id}/status`, { status });
  },
  getActiveAlerts: async () => {
    return api.get('/alerts/active');
  },
  getPublicActiveAlerts: async () => {
    return api.get('/public/active-alerts');
  },
};
