// client/src/pages/verify-email/[token].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import Link from 'next/link';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Memverifikasi akun Anda...');

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const response = await api.get(`/users/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Verifikasi berhasil! Anda sekarang bisa login.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error?.message || 'Gagal memverifikasi. Token mungkin tidak valid.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      {status === 'verifying' && <LoadingSpinner />}
      <h1 className="text-2xl font-bold mb-4">{
        status === 'success' ? 'Verifikasi Berhasil!' :
        status === 'error' ? 'Verifikasi Gagal' :
        'Verifikasi Email'
      }</h1>
      <p className="mb-6">{message}</p>
      {status !== 'verifying' && (
        <Link href="/login" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
          Ke Halaman Login
        </Link>
      )}
    </div>
  );
}