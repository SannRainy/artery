import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { login as authLogin, register as authRegister, getCurrentUser } from '../services/auth'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const login = async (email, password) => {
    const { user, token } = await authLogin(email, password)
    localStorage.setItem('token', token)
    setUser(user)
    router.push('/')
  }

  const register = async (username, email, password) => {
    const { user, token } = await authRegister(username, email, password)
    localStorage.setItem('token', token)
    setUser(user)
    router.push('/')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)