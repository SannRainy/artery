// client/src/services/api.js
import axios from 'axios'

// Gunakan baseURL dari environment, fallback ke localhost saat development

// Buat instance axios

const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL,
  withCredentials: true, // penting jika menggunakan cookie auth di masa depan
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: tambahkan token JWT dari localStorage
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: handle error seperti token expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
