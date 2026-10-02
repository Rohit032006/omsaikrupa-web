import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('osk_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('osk_token');
      localStorage.removeItem('osk_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  sendOtp: (data: { email: string; name?: string }) => api.post('/auth/send-otp', data),
  verifyOtp: (data: { email: string; otp: string; name?: string }) => api.post('/auth/verify-otp', data),
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

// Vehicles
export const vehicleApi = {
  search: (params?: any) => api.get('/vehicles', { params }),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  getSeats: (id: string, date: string) => api.get(`/vehicles/${id}/seats`, { params: { date } }),
  getAll: () => api.get('/vehicles/admin/all'),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
};

// Bookings
export const bookingApi = {
  getAll: () => api.get('/bookings'),
  getById: (id: string) => api.get(`/bookings/${id}`),
  create: (data: any) => api.post('/bookings', data),
  updateStatus: (id: string, bookingStatus: string) => api.put(`/bookings/${id}/status`, { bookingStatus }),
  cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
  update: (id: string, data: any) => api.put(`/bookings/${id}`, data),
  getStats: () => api.get('/bookings/admin/stats'),
};

// Payments
export const paymentApi = {
  getAll: () => api.get('/payments'),
  submit: (data: any) => api.post('/payments', data),
  verify: (id: string) => api.put(`/payments/${id}/verify`),
  reject: (id: string) => api.put(`/payments/${id}/reject`),
};

// Drivers
export const driverApi = {
  getAll: () => api.get('/drivers'),
  getAvailable: () => api.get('/drivers/available'),
  create: (data: any) => api.post('/drivers', data),
  update: (id: string, data: any) => api.put(`/drivers/${id}`, data),
  delete: (id: string) => api.delete(`/drivers/${id}`),
};

// Users
export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  updateStatus: (id: string, status: string) => api.put(`/users/${id}/status`, { status }),
};

// Notifications
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Settings
export const settingsApi = {
  get: () => api.get('/settings'),
  getAdmin: () => api.get('/settings/admin'),
  update: (data: any) => api.put('/settings', data),
};

// Reports
export const reportApi = {
  getBookings: (params?: any) => api.get('/reports/bookings', { params }),
  getRevenue: (period?: string) => api.get('/reports/revenue', { params: { period } }),
  getVehicles: () => api.get('/reports/vehicles'),
  getPayments: () => api.get('/reports/payments'),
  getCancellations: () => api.get('/reports/cancellations'),
};
