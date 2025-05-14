import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import LoginForm from '../components/Auth/LoginForm'
import { useAuth } from '../contexts/AuthContexts'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const returnUrl = router.query.returnUrl || '/'
      router.replace(returnUrl)
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Sedang redirect
  }

  return (
    <>
      <Head>
        <title>Login | Pinterest Clone</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              onClick={() => router.push('/register')}
              className="font-medium text-primary hover:text-primary-dark"
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
