import api from './api'

export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)  // Simpan token
    }
    return response.data
  } catch (error) {
    console.error("Login failed", error)
    throw new Error('Login failed, please check your credentials or try again later.')
  }
}

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/users/register', { 
      username, 
      email, 
      password 
    })
    return response.data
  } catch (error) {
    console.error("Registration failed", error)
    throw new Error('Registration failed, please check your details or try again later.')
  }
}

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token') // Ambil token dari localStorage
    if (token) {
      api.defaults.headers['Authorization'] = `Bearer ${token}`  // Set header authorization
    }
    const response = await api.get('/users/me')
    return response.data
  } catch (error) {
    console.error("Failed to fetch current user", error)
    return null
  }
}
