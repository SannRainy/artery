import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useRouter } from 'next/router'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

 
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)  
      setUser(data.user)  
      router.push('/')  
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')  
    }
  }, [router])

  
  const logout = useCallback(() => {
    localStorage.removeItem('token')  
    setUser(null)  
    router.push('/login')  
  }, [router])

  
  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') 
      if (!token) {
        logout() 
        return
      }
      const { data } = await api.get('/auth/me') 
      setUser(data)  
    } catch (error) {
      console.error("Fetching user failed:", error)
      logout()  
    } finally {
      setLoading(false)  
    }
  }, [logout])

  
  useEffect(() => {
    const token = localStorage.getItem('token') 
    if (token) {
      fetchUser()  
    } else {
      setLoading(false) 
    }
  }, [fetchUser])

  return { user, loading, login, logout, fetchUser }
}
