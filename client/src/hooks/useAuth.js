import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useRouter } from 'next/router'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fungsi login untuk mengautentikasi pengguna
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)  // Simpan token ke localStorage
      setUser(data.user)  // Simpan data pengguna
      router.push('/')  // Redirect ke halaman utama setelah login berhasil
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')  // Tangani error login
    }
  }, [router])

  // Fungsi logout untuk mengeluarkan pengguna
  const logout = useCallback(() => {
    localStorage.removeItem('token')  // Hapus token dari localStorage
    setUser(null)  // Reset data pengguna
    router.push('/login')  // Redirect ke halaman login
  }, [router])

  // Fungsi untuk mengambil data pengguna yang sedang login
  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')  // Ambil token dari localStorage
      if (!token) {
        logout()  // Logout jika tidak ada token
        return
      }
      const { data } = await api.get('/auth/me')  // Ambil data pengguna dengan API
      setUser(data)  // Simpan data pengguna
    } catch (error) {
      console.error("Fetching user failed:", error)
      logout()  // Logout jika ada error saat mengambil data pengguna
    } finally {
      setLoading(false)  // Set loading ke false setelah proses selesai
    }
  }, [logout])

  // Cek token ketika komponen pertama kali dimuat
  useEffect(() => {
    const token = localStorage.getItem('token')  // Cek token yang tersimpan di localStorage
    if (token) {
      fetchUser()  // Jika ada token, ambil data pengguna
    } else {
      setLoading(false)  // Jika tidak ada token, set loading ke false
    }
  }, [fetchUser])

  return { user, loading, login, logout, fetchUser }
}
