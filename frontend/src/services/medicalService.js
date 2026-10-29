import api from './api';

export const medicalService = {
  getAllHospitals: async (params = {}) => {
    return api.get('/hospitals', { params });
  },
  getHospitalById: async (id) => {
    return api.get(`/hospitals/${id}`);
  },
  createHospital: async (data) => {
    return api.post('/hospitals', data);
  },
  updateHospital: async (id, data) => {
    return api.put(`/hospitals/${id}`, data);
  },
  deleteHospital: async (id) => {
    return api.delete(`/hospitals/${id}`);
  },
  requestAmbulance: async (data) => {
    return api.post('/hospitals/ambulance/request', data);
  },
  getAllAmbulanceRequests: async () => {
    return api.get('/hospitals/ambulance/all');
  },
  getMyAmbulanceRequests: async () => {
    return api.get('/hospitals/ambulance/my-requests');
  },
  updateAmbulanceStatus: async (id, status, hospitalId, notes) => {
    return api.put(`/hospitals/ambulance/${id}/status`, { status, hospitalId, notes });
  },
};
