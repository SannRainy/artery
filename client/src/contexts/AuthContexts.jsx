import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { login as authLogin, register as authRegister, getCurrentUser } from '../services/auth'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (err) {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
  try {
    const { user, token } = await authLogin(email, password)
    localStorage.setItem('token', token)
    setUser(user)
    router.push('/')
    return { success: true }
  } catch (err) {
    console.warn('Login gagal:', err?.response?.data?.message || err.message)
    return {
      success: false,
      message: err?.response?.data?.message || 'Login gagal. Coba lagi.',
    }
  }
}

  const register = async (username, email, password) => {
  try {
    const { user, token } = await authRegister(username, email, password)
    localStorage.setItem('token', token)
    setUser(user)
    router.push('/')
    return { success: true }
  } catch (err) {
    console.warn('Registration error:', err?.response?.data?.message || err.message)
    return {
      success: false,
      message: err?.response?.data?.message || 'Email mungkin sudah terpakai. Silakan coba lagi.',
    }
  }
}

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
  }, [router])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser: loadUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)