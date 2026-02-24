import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Challenges API
export const challengesAPI = {
  getTypes: () => api.get('/challenges/types'),
  getAll: () => api.get('/challenges'),
  getOne: (id: string) => api.get(`/challenges/${id}`),
  getProgress: (id: string) => api.get(`/challenges/${id}/progress`),
  create: (data: any) => api.post('/challenges', data),
};

// Accounts API
export const accountsAPI = {
  getAll: () => api.get('/accounts'),
  getOne: (id: string) => api.get(`/accounts/${id}`),
  getStats: (id: string) => api.get(`/accounts/${id}/stats`),
  getRules: (id: string) => api.get(`/accounts/${id}/rules`),
  requestPayout: (id: string, data: any) => api.post(`/accounts/${id}/payout`, data),
};

// Trades API
export const tradesAPI = {
  getAll: (params?: any) => api.get('/trades', { params }),
  getOpen: (params?: any) => api.get('/trades/open', { params }),
  getOne: (id: string) => api.get(`/trades/${id}`),
  create: (data: any) => api.post('/trades', data),
  close: (id: string, data: any) => api.post(`/trades/${id}/close`, data),
};

// Payouts API
export const payoutsAPI = {
  getAll: () => api.get('/payouts'),
  getOne: (id: string) => api.get(`/payouts/${id}`),
  create: (data: any) => api.post('/payouts', data),
};

// Admin API
export const adminAPI = {
  getUsers: (params?: any) => api.get('/users/admin/all', { params }),
  getUser: (id: string) => api.get(`/users/admin/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/admin/${id}`, data),
  suspendUser: (id: string, data: any) => api.post(`/users/admin/${id}/suspend`, data),
  getStats: () => api.get('/users/admin/dashboard/stats'),
  getPayoutHistory: (params?: any) => api.get('/payouts/admin/history', { params }),
  approvePayout: (id: string) => api.post(`/payouts/admin/${id}/approve`),
  rejectPayout: (id: string, data: any) => api.post(`/payouts/admin/${id}/reject`, data),
};
