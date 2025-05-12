import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api', // Gunakan proxy Next.js
  withCredentials: true
})

// Interceptor untuk menambahkan token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// Interceptor untuk handling error
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Handle token expired
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api