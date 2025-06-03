import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage jika ada (pastikan hanya di browser)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Jika data bertipe FormData, set header Content-Type khusus dan matikan transformRequest default
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
      config.transformRequest = (data) => data; // Disable JSON serialization
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Hapus token dari localStorage jika unauthorized
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
