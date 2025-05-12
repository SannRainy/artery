import api from './api'

export const login = async (email, password) => {
  const response = await api.post('/users/login', { email, password })
  return response.data
}

export const register = async (username, email, password) => {
  const response = await api.post('/users/register', { 
    username, 
    email, 
    password 
  })
  return response.data
}

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me')
    return response.data
  } catch (error) {
    return null
  }
}