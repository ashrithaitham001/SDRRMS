import api from './api';

export const adminService = {
  getAllUsers: async () => {
    return api.get('/admin/users');
  },
  toggleUserActive: async (userId) => {
    return api.put(`/admin/users/${userId}/toggle-active`);
  },
  updateUserRole: async (userId, role) => {
    return api.put(`/admin/users/${userId}/role`, { role });
  },
  getAuditLogs: async () => {
    return api.get('/admin/audit-logs');
  },
};
