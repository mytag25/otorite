import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || `http://${window.location.hostname}:8001`;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
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

// ============ Auth API ============
export const authAPI = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/auth/password', data);
    return response.data;
  },

  listUsers: async (params = {}) => {
    const response = await api.get('/auth/users', { params });
    return response.data;
  },

  updateUserRole: async (userId, isAdmin) => {
    const response = await api.put(`/auth/users/${userId}/role`, null, {
      params: { isAdmin }
    });
    return response.data;
  },

  deleteUser: async (userId) => {
    await api.delete(`/auth/users/${userId}`);
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', null, { params: { token } });
    return response.data;
  },

  resendVerification: async () => {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  },
};

// ============ Vehicles API ============
export const vehiclesAPI = {
  list: async (params = {}) => {
    const response = await api.get('/vehicles', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  create: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  update: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/vehicles/${id}`);
  },
};

// ============ Favorites API ============
export const favoritesAPI = {
  list: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  add: async (vehicleId) => {
    const response = await api.post(`/favorites/${vehicleId}`);
    return response.data;
  },

  remove: async (vehicleId) => {
    const response = await api.delete(`/favorites/${vehicleId}`);
    return response.data;
  },
};

// ============ Static Data API ============
export const staticAPI = {
  getBrands: async () => {
    const response = await api.get('/brands');
    return response.data;
  },

  getSegments: async () => {
    const response = await api.get('/segments');
    return response.data;
  },

  getYears: async () => {
    const response = await api.get('/years');
    return response.data;
  },
};

// ============ Blog API ============
export const blogAPI = {
  list: async (params = {}) => {
    const response = await api.get('/blog', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/blog/${id}`);
    return response.data;
  },

  create: async (postData) => {
    const response = await api.post('/blog', postData);
    return response.data;
  },

  update: async (id, postData) => {
    const response = await api.put(`/blog/${id}`, postData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/blog/${id}`);
  },
};

// ============ Garage API ============
export const garageAPI = {
  // Keşfet - tüm public araçlar
  explore: async (params = {}) => {
    const response = await api.get('/garage/explore', { params });
    return response.data;
  },

  // Kullanıcı garajı (public)
  getUserGarage: async (userId) => {
    const response = await api.get(`/garage/user/${userId}`);
    return response.data;
  },

  // Kendi garajım
  getMyGarage: async () => {
    const response = await api.get('/garage/my');
    return response.data;
  },

  // Tek araç detayı
  getVehicle: async (id) => {
    const response = await api.get(`/garage/${id}`);
    return response.data;
  },

  // Araç ekle
  addVehicle: async (vehicleData) => {
    const response = await api.post('/garage', vehicleData);
    return response.data;
  },

  // Araç güncelle
  updateVehicle: async (id, vehicleData) => {
    const response = await api.put(`/garage/${id}`, vehicleData);
    return response.data;
  },

  // Araç sil
  deleteVehicle: async (id) => {
    await api.delete(`/garage/${id}`);
  },

  // Beğen/Beğenme
  toggleLike: async (id) => {
    const response = await api.post(`/garage/${id}/like`);
    return response.data;
  },

  // Yorum ekle
  addComment: async (vehicleId, content) => {
    const response = await api.post(`/garage/${vehicleId}/comment`, null, {
      params: { content }
    });
    return response.data;
  },

  // Yorum sil
  deleteComment: async (vehicleId, commentId) => {
    await api.delete(`/garage/${vehicleId}/comment/${commentId}`);
  },

  // Aktivite Akışı
  getFeed: async (params = {}) => {
    const response = await api.get('/garage/feed', { params });
    return response.data;
  },

  // Kullanıcı Takip Et
  followUser: async (userId) => {
    const response = await api.post(`/garage/follow/${userId}`);
    return response.data;
  },

  // Takipten Çık
  unfollowUser: async (userId) => {
    const response = await api.post(`/garage/unfollow/${userId}`);
    return response.data;
  },

  // Takipçileri Getir
  getFollowers: async (userId) => {
    const response = await api.get(`/garage/user/${userId}/followers`);
    return response.data;
  },

  // Takip Edilenleri Getir
  getFollowing: async (userId) => {
    const response = await api.get(`/garage/user/${userId}/following`);
    return response.data;
  },
};

// ============ AI API ============
export const aiAPI = {
  recommend: async (query) => {
    const response = await api.post('/ai/recommend', { query });
    return response.data;
  },

  identify: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.post('/ai/identify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  chat: async (message, garageContext = null) => {
    const response = await api.post('/ai/chat', { message, garageContext });
    return response.data;
  },

  generateSummary: async (vehicle) => {
    const response = await api.post('/ai/generate-summary', { vehicle });
    return response.data;
  },

  snap: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    const response = await api.post('/ai/snap', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  snapRate: async (vehicleData) => {
    const response = await api.post('/ai/snap-rate', vehicleData);
    return response.data;
  },

  wizard: async (formData) => {
    const response = await api.post('/ai/wizard', formData);
    return response.data;
  },

  compareAnalyst: async (vehicleIds) => {
    const response = await api.post('/ai/compare-analyst', { vehicleIds });
    return response.data;
  },
};

// ============ Reviews API ============
export const reviewsAPI = {
  // Araç yorumlarını getir
  getByVehicle: async (vehicleId, params = {}) => {
    const response = await api.get(`/reviews/vehicle/${vehicleId}`, { params });
    return response.data;
  },

  // Araç puan istatistikleri
  getStats: async (vehicleId) => {
    const response = await api.get(`/reviews/vehicle/${vehicleId}/stats`);
    return response.data;
  },

  // Yeni yorum ekle
  create: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Yorum güncelle
  update: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Yorum sil
  delete: async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`);
  },

  // Beğen/Beğenme
  toggleLike: async (reviewId) => {
    const response = await api.post(`/reviews/${reviewId}/like`);
    return response.data;
  },
};

export default api;

