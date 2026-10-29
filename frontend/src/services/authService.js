import api from './api';

export const authService = {
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },
  requestOtp: async (email, purpose = 'PASSWORD_RESET') => {
    return api.post(`/auth/otp/request?email=${encodeURIComponent(email)}&purpose=${purpose}`);
  },
  verifyOtp: async (email, otpCode, purpose = 'PASSWORD_RESET') => {
    return api.post('/auth/otp/verify', { email, otpCode, purpose });
  },
  resetPassword: async (data) => {
    return api.post('/auth/password-reset', data);
  },
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },
  updateProfile: async (updates) => {
    return api.put('/auth/profile', updates);
  },
};
