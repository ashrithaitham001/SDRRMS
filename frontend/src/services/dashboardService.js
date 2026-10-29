import api from './api';

export const dashboardService = {
  getStats: async () => {
    return api.get('/dashboard/stats');
  },
  getPublicStats: async () => {
    return api.get('/public/stats');
  },
  getMapOverview: async () => {
    return api.get('/dashboard/map-overview');
  },
};
