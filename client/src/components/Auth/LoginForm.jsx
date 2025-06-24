// client/src/components/Auth/LoginForm.jsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContexts';
import { resendVerificationEmail } from '../../services/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const schema = yup.object().shape({
  email: yup.string().email('Format email tidak valid').required('Email wajib diisi'),
  password: yup.string().required('Password wajib diisi'),
  remember: yup.boolean(),
});

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showResend, setShowResend] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    setErrorMessage('');
    setShowResend(false);

    try {
      await login(email, password);
      toast.success('Login berhasil!');
      router.push('/');
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Login gagal, silakan coba lagi.';
      setErrorMessage(message);
      
      if (message.toLowerCase().includes('belum diverifikasi') || message.toLowerCase().includes('not verified')) {
        setShowResend(true);
      }
      
      toast.error(`Login Gagal: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email = getValues('email'); 
    if (!email) {
      toast.error('Silakan masukkan alamat email Anda di form terlebih dahulu.');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await resendVerificationEmail(email);
      toast.success(response.message || 'Email verifikasi baru telah dikirim.');
      setShowResend(false);
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Gagal mengirim ulang email.';
      toast.error(message);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && <div className="text-red-500 text-sm mb-4">{errorMessage}</div>}

      <Input
        label="Email"
        type="email"
        autoFocus
        {...register('email')}
        error={errors.email}
      />

      <Input
        label="Password"
        type="password"
        {...register('password')}
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

      {showResend && (
        <div className="text-sm text-center">
          <button
            type="button"
            onClick={handleResendVerification}
            className="font-medium text-primary hover:underline disabled:text-gray-400"
            disabled={loading}
          >
            Kirim ulang email verifikasi
          </button>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <LoadingSpinner /> : 'Sign in'}
      </Button>

      <div className="text-sm text-center">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
          Register
        </Link>
      </div>
    </form>
  );
}