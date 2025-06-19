import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContexts'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-toastify'  

export default function LoginForm() {
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async ({ email, password }) => {
  setLoading(true)
  setErrorMessage('')
  try {
    const result = await login(email, password)

    if (result.success) {
      toast.success('Login berhasil!')
    } else {
      setErrorMessage(result.message)
      toast.error(result.message)
    }
  } catch (err) {
    
    const fallbackMsg = 'Terjadi kesalahan tak terduga.'
    setErrorMessage(fallbackMsg)
    toast.error(fallbackMsg)
  } finally {
    setLoading(false)
  }
}
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>} 

      <Input
        label="Email"
        type="email"
        autoFocus
        {...register('email', { 
          required: 'Email is required', 
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: 'Invalid email address'
          }
        })}
        error={errors.email}
      />

      <Input
        label="Password"
        type="password"
        {...register('password', { required: 'Password is required' })}
        error={errors.password} 
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            {...register('remember')}
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link href="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

      <div className="text-sm text-center">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
          Register
        </Link>
      </div>
    </form>
  )
}
