import api from './api';

export const notificationService = {
  getUserNotifications: async () => {
    return api.get('/notifications');
  },
  getUnreadNotifications: async () => {
    return api.get('/notifications/unread');
  },
  markAsRead: async (id) => {
    return api.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    return api.put('/notifications/read-all');
  },
};
