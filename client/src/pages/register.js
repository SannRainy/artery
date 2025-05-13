import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import RegisterForm from '../components/Auth/RegisterForm'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Jika user sudah login, redirect ke halaman utama
  useEffect(() => {
    if (!loading && user) {
      router.replace('/')
    }
  }, [user, loading, router])

  // Saat loading atau user sudah login, jangan render halaman
  if (loading || user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Register | Pinterest Clone</title>
      </Head>

      <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <section className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900" aria-label="Register title">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              onClick={() => router.push('/login')}
              className="font-medium text-primary hover:text-primary-dark"
              aria-label="Link to login"
            >
              sign in to your existing account
            </button>
          </p>
        </section>

        <section className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <RegisterForm />
          </div>
        </section>
      </main>
    </>
  )
}
