import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import RegisterForm from '../components/Auth/RegisterForm'
import { useAuth } from '../contexts/AuthContexts'

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/')
    }
  }, [user, loading, router])

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
        <title>Register | Artery Project</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10">
          <section className="sm:mx-auto sm:w-full sm:max-w-md">
            {/* Logo Placeholder - Consistent with login page */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center mb-4 transition-all duration-500 hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-gray-900" aria-label="Register title">
                Join Artery Today
              </h2>
              <p className="text-sm text-gray-600">
                Start your journey with our platform
              </p>
            </div>
          </section>

          <section className="mt-8 sm:mx-auto sm:w-full sm:max-w-md transition-all duration-300 hover:shadow-md">
            <div className="bg-white py-8 px-6 shadow-lg rounded-xl backdrop-blur-sm bg-opacity-90 border border-gray-100">
              <RegisterForm />
            </div>
          </section>
        </div>
      </main>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  )
}