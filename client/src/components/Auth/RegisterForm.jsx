import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisterForm() {
  const { register } = useAuth()
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async ({ username, email, password }) => {
    setLoading(true)
    setErrorMessage('') // Reset error message
    try {
      await register(username, email, password)
      // Redirect or take further action after successful registration
    } catch (error) {
      setErrorMessage('Registration failed, please try again.') // Set error message
      console.error('Registration failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>} {/* Error message display */}

      <Input
        label="Username"
        {...formRegister('username', { required: 'Username is required' })}
        error={errors.username}
      />

      <Input
        label="Email"
        type="email"
        {...formRegister('email', { 
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
        error={errors.email}
      />

      <Input
        label="Password"
        type="password"
        {...formRegister('password', { 
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters'
          }
        })}
        error={errors.password}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </Button>

      <div className="text-sm text-center">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
          Login
        </Link>
      </div>
    </form>
  )
}
