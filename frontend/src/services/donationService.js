import api from './api';

export const donationService = {
  getAllDonations: async (params = {}) => {
    return api.get('/donations', { params });
  },
  getDonationById: async (id) => {
    return api.get(`/donations/${id}`);
  },
  getDonationByRef: async (ref) => {
    return api.get(`/donations/ref/${ref}`);
  },
  createDonation: async (data) => {
    return api.post('/donations', data);
  },
  updateStatus: async (id, status, note) => {
    return api.put(`/donations/${id}/status`, { status, note });
  },
  allocateDonation: async (data) => {
    return api.post('/donations/allocate', data);
  },
  getAllAllocations: async () => {
    return api.get('/donations/allocations/all');
  },
  getDonationAllocations: async (id) => {
    return api.get(`/donations/${id}/allocations`);
  },
  getMyDonations: async () => {
    return api.get('/donations/my-donations');
  },
};
