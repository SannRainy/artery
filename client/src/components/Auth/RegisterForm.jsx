// client/src/components/Auth/RegisterForm.jsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContexts'; 
import Input from '../ui/Input';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const schema = yup.object().shape({
  username: yup.string().required('Username wajib diisi').min(3, 'Username minimal 3 karakter'),
  email: yup.string().email('Format email tidak valid').required('Email wajib diisi'),
  password: yup.string().required('Password wajib diisi').min(6, 'Password minimal 6 karakter'),
});

export default function RegisterForm() {
  const { register: authRegister } = useAuth(); 
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ username, email, password }) => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {

      const response = await authRegister(username, email, password);

      const message = response.message || 'Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.';
      setSuccessMessage(message);
      toast.success(message);
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Registrasi gagal, silakan coba lagi.';
      setErrorMessage(message);
      toast.error(`Registrasi Gagal: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && <div className="text-red-500 text-sm mb-4">{errorMessage}</div>}
      {successMessage && <div className="text-green-600 text-sm mb-4">{successMessage}</div>}

      {!successMessage && (
        <>
          <Input
            label="Username"
            type="text"
            autoFocus
            {...register('username')}
            error={errors.username}
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Create Account'}
          </Button>
        </>
      )}

      <div className="text-sm text-center">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
          Login
        </Link>
      </div>
    </form>
  );
}