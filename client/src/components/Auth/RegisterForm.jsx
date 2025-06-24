import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContexts'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-toastify' 

export default function RegisterForm() {
  const { register: authRegister } = useAuth()
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async ({ username, email, password }) => {
      setLoading(true);
      setErrorMessage('');
      try {
        const result = await authRegister(username, email, password);
        if (result.success) {
          toast.success(result.message || 'Registrasi berhasil! Cek email Anda.');
        } else {
          setErrorMessage(result.message);
          toast.error(result.message);
        }
      } catch (error) {
      const fallback = 'Email mungkin sudah terpakai. Silakan coba lagi.'
      setErrorMessage(fallback)
      toast.error(fallback)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

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
