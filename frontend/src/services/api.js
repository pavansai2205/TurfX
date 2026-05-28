const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import axios from 'axios';

// Create customized Axios client
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically append active session token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('turfx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Unified Error handling helper
export const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    // If standard express validator errors list exists
    if (error.response.data.errors) {
      return error.response.data.errors.map(err => err.msg).join(', ');
    }
    return error.response.data.message || 'Something went wrong';
  }
  return error.message || 'Server connection timed out';
};

// Decoupled API requests definitions
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

export const turfAPI = {
  getAll: (params) => api.get('/turfs', { params }),
  getById: (id) => api.get(`/turfs/${id}`),
  create: (data) => api.post('/turfs', data),
  update: (id, data) => api.put(`/turfs/${id}`, data),
  delete: (id) => api.delete(`/turfs/${id}`),
};

export const bookingAPI = {
  getAvailability: (turfId, date) => api.get('/bookings/availability', { params: { turfId, date } }),
  create: (data) => api.post('/bookings', data),
  getMyHistory: () => api.get('/bookings/my-history'),
  getOwnerLedgers: () => api.get('/bookings/owner-ledgers'),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getReceipt: (bookingId) => api.get(`/payments/receipt/${bookingId}`),
};

export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getAllUsers: () => api.get('/admin/users'),
  toggleRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllBookings: () => api.get('/admin/bookings'),
};

// AI services
export const aiAPI = {
  chatbot: (message, userId) => api.post('/ai/chatbot', { message, userId }),
  getSuggestions: (userId) => api.get('/ai/recommendations', { params: { userId } }),
  getPeakPrediction: (turfId, date) => api.get('/ai/peak-prediction', { params: { turfId, date } }),
};

// Upload service
export const uploadAPI = {
  uploadImage: (base64Data) => api.post('/upload', { image: base64Data }),
};

export default api;
