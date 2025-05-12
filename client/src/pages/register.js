import { useRouter } from 'next/router'
import RegisterForm from '../components/Auth/RegisterForm'
import Head from 'next/head'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Register | Pinterest Clone</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button 
              onClick={() => router.push('/login')}
              className="font-medium text-primary hover:text-primary-dark"
            >
              sign in to your existing account
            </button>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <RegisterForm />
          </div>
        </div>
      </div>
    </>
  )
}