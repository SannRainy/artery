import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Link from 'next/link'

export default function LoginForm() {
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        {...register('email', { required: 'Email is required' })}
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

      <Button type="submit" className="w-full">
        Sign in
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