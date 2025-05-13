import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import LoginForm from '../components/Auth/LoginForm'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/') // Avoid going back to login
    }
  }, [user, loading, router])

  // Wait for auth loading to finish
  if (loading || user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Login | Pinterest Clone</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900" aria-label="Sign in title">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              onClick={() => router.push('/register')}
              className="font-medium text-primary hover:text-primary-dark"
              aria-label="Go to register page"
            >
              create a new account
            </button>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  )
}
