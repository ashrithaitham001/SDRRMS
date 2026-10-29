import api from './api';

export const resourceService = {
  getAllResources: async (params = {}) => {
    return api.get('/resources', { params });
  },
  getResourceById: async (id) => {
    return api.get(`/resources/${id}`);
  },
  createResource: async (data) => {
    return api.post('/resources', data);
  },
  updateResource: async (id, data) => {
    return api.put(`/resources/${id}`, data);
  },
  deleteResource: async (id) => {
    return api.delete(`/resources/${id}`);
  },
  distributeResource: async (id, data) => {
    return api.post(`/resources/${id}/distribute`, data);
  },
  getResourceTransactions: async (id) => {
    return api.get(`/resources/${id}/transactions`);
  },
  getAllTransactions: async () => {
    return api.get('/resources/transactions/all');
  },
  getLowStockResources: async () => {
    return api.get('/resources/low-stock');
  },
};
