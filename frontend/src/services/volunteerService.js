import api from './api';

export const volunteerService = {
  getAllVolunteers: async (params = {}) => {
    return api.get('/volunteers', { params });
  },
  getMyProfile: async () => {
    return api.get('/volunteers/my-profile');
  },
  getProfileByUserId: async (userId) => {
    return api.get(`/volunteers/user/${userId}`);
  },
  updateMyProfile: async (data) => {
    return api.put('/volunteers/my-profile', data);
  },
  verifyVolunteer: async (id, status) => {
    return api.put(`/volunteers/${id}/verify`, { status });
  },
  getMyAssignments: async () => {
    return api.get('/volunteers/my-assignments');
  },
  updateAssignmentStatus: async (assignmentId, status, notes) => {
    return api.put(`/volunteers/assignments/${assignmentId}/status`, { status, notes });
  },
};
