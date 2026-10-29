import api from './api';

export const missionService = {
  getAllMissions: async (status) => {
    return api.get('/missions', { params: status ? { status } : {} });
  },
  getMissionById: async (id) => {
    return api.get(`/missions/${id}`);
  },
  createMission: async (data) => {
    return api.post('/missions', data);
  },
  updateStatus: async (id, status) => {
    return api.put(`/missions/${id}/status`, { status });
  },
  assignVolunteer: async (id, volunteerId, notes) => {
    return api.post(`/missions/${id}/assign-volunteer`, { volunteerId, notes });
  },
  getAssignments: async (id) => {
    return api.get(`/missions/${id}/assignments`);
  },
};
