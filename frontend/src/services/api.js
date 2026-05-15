import axios from 'axios';

const API_URL =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  'http://localhost:5000/api';
const NORMALIZED_API_URL = API_URL.replace(/\/$/, '');
export const ASSET_BASE_URL = NORMALIZED_API_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: NORMALIZED_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const productAPI = {
  getAll: (page = 1, limit = 10, search = '') =>
    api.get('/products', {
      params: { page, limit, search }
    }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const salesAPI = {
  create: (data) => api.post('/sales', data),
  getAll: (page = 1, limit = 10) => api.get(`/sales?page=${page}&limit=${limit}`),
  getSummary: () => api.get('/sales/summary'),
};

export const exportAPI = {
  exportProducts: () => api.get('/export/products', { responseType: 'blob' }),
  exportSales: () => api.get('/export/sales', { responseType: 'blob' }),
};

export default api;
