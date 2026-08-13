import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ───
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
};

// ─── Vehicles ───
export const vehicleApi = {
  list: (params?: Record<string, any>) => api.get('/vehicles', { params }),
  realtime: () => api.get('/vehicles/realtime'),
  get: (id: number) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: number, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};

// ─── Dashboard ───
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  alertHeatmap: (days?: number) => api.get('/dashboard/alert-heatmap', { params: { days } }),
  vehicleStats: (vehicleId: number, days?: number) =>
    api.get('/dashboard/vehicle-stats', { params: { vehicle_id: vehicleId, days } }),
};

// ─── Alerts ───
export const alertApi = {
  list: (params?: Record<string, any>) => api.get('/alerts', { params }),
  active: () => api.get('/alerts/active'),
  acknowledge: (id: number, status: string) =>
    api.put(`/alerts/${id}/acknowledge`, { status }),
};

// ─── Devices ───
export const deviceApi = {
  reportGps: (data: any) => api.post('/device/gps', data),
  reportCan: (data: any) => api.post('/device/can', data),
};
