import api from './api';

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData)
};

export const applicationService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return api.get(`/applications${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.patch(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  
  // Events
  getEvents: (appId) => api.get(`/applications/${appId}/events`),
  addEvent: (appId, eventData) => api.post(`/applications/${appId}/events`, eventData),
  deleteEvent: (appId, eventId) => api.delete(`/applications/${appId}/events/${eventId}`)
};

export const resumeService = {
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  upload: (formData) => api.post('/resumes', formData),
  delete: (id) => api.delete(`/resumes/${id}`),
  setDefault: (id) => api.patch(`/resumes/${id}/default`)
};

export const interviewService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/interviews${query ? `?${query}` : ''}`);
  },
  create: (data) => api.post('/interviews', data),
  update: (id, data) => api.patch(`/interviews/${id}`, data),
  delete: (id) => api.delete(`/interviews/${id}`)
};

export const reminderService = {
  getAll: (status) => api.get(`/reminders${status ? `?status=${status}` : ''}`),
  create: (data) => api.post('/reminders', data),
  update: (id, data) => api.patch(`/reminders/${id}`, data),
  delete: (id) => api.delete(`/reminders/${id}`)
};

export const analyticsService = {
  getDashboardMetrics: () => api.get('/analytics/dashboard')
};

export const aiService = {
  parseJD: (jobDescription) => api.post('/ai/parse-jd', { jobDescription }),
  summarizeJD: (jobDescription) => api.post('/ai/summarize-jd', { jobDescription }),
  matchResume: (payload) => api.post('/ai/match-resume', payload)
};
