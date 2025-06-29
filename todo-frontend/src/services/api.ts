import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  changePassword: (passwords: any) => api.post('/auth/change-password', passwords),
};

// Tasks API
export const tasksAPI = {
  getAll: (params?: any) => api.get('/tasks', { params }),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (taskData: any) => api.post('/tasks', taskData),
  update: (id: string, taskData: any) => api.put(`/tasks/${id}`, taskData),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  assignUsers: (id: string, userIds: string[]) => 
    api.post(`/tasks/${id}/assign`, { userIds }),
  addComment: (id: string, content: string) => 
    api.post(`/tasks/${id}/comment`, { content }),
  complete: (id: string) => api.post(`/tasks/${id}/complete`),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData: any) => api.put('/users/profile', profileData),
  getStats: () => api.get('/users/stats'),
  search: (query: string) => api.get('/users/search', { params: { q: query } }),
  getById: (id: string) => api.get(`/users/${id}`),
};

export default api; 
