// client/src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
});

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
// api.js
api.interceptors.response.use(
  (response) => response,
  (error) => {  
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      // Jangan redirect di sini
    }
    return Promise.reject(error)
  }
)

export default api
