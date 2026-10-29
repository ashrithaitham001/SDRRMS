import api from './api';

export const requestService = {
  searchRequests: async (params = {}) => {
    return api.get('/requests', { params });
  },
  getRequestById: async (id) => {
    return api.get(`/requests/${id}`);
  },
  trackRequest: async (trackingNumber) => {
    return api.get(`/requests/track/${trackingNumber}`);
  },
  trackPublicRequest: async (trackingNumber) => {
    return api.get(`/public/track/${trackingNumber}`);
  },
  submitRequest: async (data) => {
    return api.post('/requests', data);
  },
  submitSos: async (data) => {
    return api.post('/requests/sos', data);
  },
  submitPublicSos: async (data) => {
    return api.post('/public/sos', data);
  },
  updateStatus: async (id, status, remarks) => {
    return api.put(`/requests/${id}/status`, { status, remarks });
  },
  assignRequest: async (id, volunteerId, ngoName, remarks) => {
    return api.put(`/requests/${id}/assign`, { volunteerId, ngoName, remarks });
  },
  getRequestHistory: async (id) => {
    return api.get(`/requests/${id}/history`);
  },
  getMyRequests: async () => {
    return api.get('/requests/my-requests');
  },
  getAssignedRequests: async () => {
    return api.get('/requests/assigned-to-me');
  },
  getCriticalRequests: async () => {
    return api.get('/requests/critical');
  },
};
