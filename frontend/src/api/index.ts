import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 3000,
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
      window.location.href = import.meta.env.BASE_URL;
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Demo Mode Mock Data ───
const DEMO_VEHICLES = [
  { vehicle_id: 1, plate_number: 'FW-001', name: '水罐消防车 FW-001', vehicle_type: 'water_foam', status: 'moving', latitude: 24.8627, longitude: 67.0031, speed: 42, fleet_id: 'Alpha', last_report: new Date().toISOString() },
  { vehicle_id: 2, plate_number: 'FW-003', name: '泡沫消防车 FW-003', vehicle_type: 'water_foam', status: 'moving', latitude: 24.8580, longitude: 67.0080, speed: 65, fleet_id: 'Alpha', last_report: new Date().toISOString() },
  { vehicle_id: 3, plate_number: 'LP-002', name: '云梯消防车 LP-002', vehicle_type: 'ladder', status: 'idle', latitude: 24.8700, longitude: 67.0150, speed: 0, fleet_id: 'Bravo', last_report: new Date().toISOString() },
  { vehicle_id: 4, plate_number: 'PM-005', name: '市政泵车 PM-005', vehicle_type: 'municipal_pump', status: 'moving', latitude: 24.8550, longitude: 67.0200, speed: 92, fleet_id: 'Bravo', last_report: new Date().toISOString() },
  { vehicle_id: 5, plate_number: 'FW-007', name: '消防车 FW-007', vehicle_type: 'water_foam', status: 'idle', latitude: 24.8480, longitude: 67.0100, speed: 0, fleet_id: 'Alpha', last_report: new Date().toISOString() },
  { vehicle_id: 6, plate_number: 'DR-001', name: '消防无人机车 DR-001', vehicle_type: 'drone', status: 'moving', latitude: 24.8650, longitude: 67.0250, speed: 35, fleet_id: 'Charlie', last_report: new Date().toISOString() },
  { vehicle_id: 7, plate_number: 'RB-001', name: '机器人消防车 RB-001', vehicle_type: 'robot', status: 'idle', latitude: 24.8520, longitude: 67.0050, speed: 0, fleet_id: 'Charlie', last_report: new Date().toISOString() },
  { vehicle_id: 8, plate_number: 'MC-003', name: '消防摩托 MC-003', vehicle_type: 'motorcycle', status: 'offline', latitude: 24.8750, longitude: 67.0180, speed: 0, fleet_id: 'Alpha', last_report: new Date(Date.now() - 3600000).toISOString() },
  { vehicle_id: 9, plate_number: 'FW-008', name: '水罐消防车 FW-008', vehicle_type: 'water_foam', status: 'moving', latitude: 24.8600, longitude: 67.0300, speed: 55, fleet_id: 'Bravo', last_report: new Date().toISOString() },
  { vehicle_id: 10, plate_number: 'LP-004', name: '云梯消防车 LP-004', vehicle_type: 'ladder', status: 'idle', latitude: 24.8450, longitude: 67.0120, speed: 0, fleet_id: 'Alpha', last_report: new Date().toISOString() },
  { vehicle_id: 11, plate_number: 'PM-006', name: '市政泵车 PM-006', vehicle_type: 'municipal_pump', status: 'moving', latitude: 24.8680, longitude: 67.0080, speed: 38, fleet_id: 'Bravo', last_report: new Date().toISOString() },
  { vehicle_id: 12, plate_number: 'FW-009', name: '泡沫消防车 FW-009', vehicle_type: 'water_foam', status: 'moving', latitude: 24.8560, longitude: 67.0220, speed: 71, fleet_id: 'Alpha', last_report: new Date().toISOString() },
  { vehicle_id: 13, plate_number: 'SM-001', name: '小型消防车 SM-001', vehicle_type: 'small', status: 'idle', latitude: 24.8720, longitude: 67.0060, speed: 0, fleet_id: 'Charlie', last_report: new Date().toISOString() },
  { vehicle_id: 14, plate_number: 'SM-002', name: '小型消防车 SM-002', vehicle_type: 'small', status: 'offline', latitude: 24.8500, longitude: 67.0280, speed: 0, fleet_id: 'Charlie', last_report: new Date(Date.now() - 7200000).toISOString() },
  { vehicle_id: 15, plate_number: 'FW-010', name: '消防车 FW-010', vehicle_type: 'water_foam', status: 'moving', latitude: 24.8640, longitude: 67.0160, speed: 48, fleet_id: 'Alpha', last_report: new Date().toISOString() },
];

const DEMO_ALERTS = [
  { id: 1, vehicle_id: 5, alert_type: 'emergency', severity: 'critical', latitude: 24.848, longitude: 67.01, timestamp: new Date(Date.now() - 120000).toISOString(), description: '紧急按钮触发 — FW-007', status: 'active' },
  { id: 2, vehicle_id: 4, alert_type: 'speed', severity: 'high', latitude: 24.855, longitude: 67.02, timestamp: new Date(Date.now() - 480000).toISOString(), description: '超速 92km/h，阈值 80km/h — PM-005', status: 'active' },
  { id: 3, vehicle_id: 2, alert_type: 'dtc', severity: 'medium', latitude: 24.858, longitude: 67.008, timestamp: new Date(Date.now() - 900000).toISOString(), description: 'DTC故障码: P0300 — FW-003', status: 'active' },
  { id: 4, vehicle_id: 3, alert_type: 'low_fuel', severity: 'medium', latitude: 24.87, longitude: 67.015, timestamp: new Date(Date.now() - 1320000).toISOString(), description: '油量 12%，低于阈值 15% — LP-002', status: 'acknowledged' },
  { id: 5, vehicle_id: 1, alert_type: 'idle', severity: 'low', latitude: 24.8627, longitude: 67.0031, timestamp: new Date(Date.now() - 2100000).toISOString(), description: '怠速超时 25分钟 — FW-001', status: 'resolved' },
  { id: 6, vehicle_id: 9, alert_type: 'overheat', severity: 'high', latitude: 24.86, longitude: 67.03, timestamp: new Date(Date.now() - 600000).toISOString(), description: '冷却液温度 108°C — FW-008', status: 'active' },
  { id: 7, vehicle_id: 12, alert_type: 'geofence', severity: 'medium', latitude: 24.856, longitude: 67.022, timestamp: new Date(Date.now() - 1800000).toISOString(), description: '驶出围栏区域 — FW-009', status: 'acknowledged' },
  { id: 8, vehicle_id: 8, alert_type: 'comm_lost', severity: 'high', latitude: 24.875, longitude: 67.018, timestamp: new Date(Date.now() - 3600000).toISOString(), description: '通信中断 15分钟 — MC-003', status: 'active' },
];

// Check if backend is available
let backendAvailable: boolean | null = null;

async function checkBackend(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  try {
    await api.get('/auth/me', { timeout: 2000 });
    backendAvailable = true;
  } catch {
    backendAvailable = false;
  }
  return backendAvailable;
}

// ─── Auth ───
export const authApi = {
  login: async (username: string, password: string) => {
    if (await checkBackend()) {
      return api.post('/auth/login', { username, password });
    }
    // Demo mode
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('token', 'demo-token');
      return { data: { access_token: 'demo-token', token_type: 'bearer' } } as any;
    }
    throw { response: { data: { detail: 'Demo mode: use admin / admin123' } } };
  },
  me: async () => {
    if (await checkBackend()) return api.get('/auth/me');
    return { data: { id: 1, username: 'admin', name: 'Admin', role: 'super_admin', email: 'admin@sany.com', department: 'IT' } } as any;
  },
};

// ─── Vehicles ───
export const vehicleApi = {
  list: async (params?: Record<string, any>) => {
    if (await checkBackend()) return api.get('/vehicles', { params });
    return { data: { total: DEMO_VEHICLES.length, items: DEMO_VEHICLES } } as any;
  },
  realtime: async () => {
    if (await checkBackend()) return api.get('/vehicles/realtime');
    return { data: DEMO_VEHICLES } as any;
  },
  get: (id: number) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: number, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};

// ─── Dashboard ───
export const dashboardApi = {
  stats: async () => {
    if (await checkBackend()) return api.get('/dashboard/stats');
    return {
      data: {
        total_vehicles: 15, online_vehicles: 12, moving_vehicles: 7,
        idle_vehicles: 5, offline_vehicles: 2, alert_count_today: 8,
        total_distance_today: 1284, total_fuel_today: 320,
      }
    } as any;
  },
  alertHeatmap: (days?: number) => api.get('/dashboard/alert-heatmap', { params: { days } }),
  vehicleStats: (vehicleId: number, days?: number) =>
    api.get('/dashboard/vehicle-stats', { params: { vehicle_id: vehicleId, days } }),
};

// ─── Alerts ───
export const alertApi = {
  list: async (params?: Record<string, any>) => {
    if (await checkBackend()) return api.get('/alerts', { params });
    return { data: { total: DEMO_ALERTS.length, items: DEMO_ALERTS } } as any;
  },
  active: async () => {
    if (await checkBackend()) return api.get('/alerts/active');
    return { data: { total: DEMO_ALERTS.filter(a => a.status === 'active').length, items: DEMO_ALERTS.filter(a => a.status === 'active') } } as any;
  },
  acknowledge: (id: number, status: string) =>
    api.put(`/alerts/${id}/acknowledge`, { status }),
};

// ─── Devices ───
export const deviceApi = {
  reportGps: (data: any) => api.post('/device/gps', data),
  reportCan: (data: any) => api.post('/device/can', data),
};
