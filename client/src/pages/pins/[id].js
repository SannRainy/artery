// client/src/pages/pins/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getPinById } from '../../services/pins';
import PinDetailModal from '../../components/pins/PinDetailModal';
import Head from 'next/head';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function PinDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPin = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const pinData = await getPinById(id);
        setPin(pinData);
      } catch (error) {
        console.error('Error fetching pin:', error);

        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchPin();
  }, [id, router]); 

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!pin) {

    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Pin tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pin.title ? `${pin.title} | Artery Project` : 'Pin Detail | Artery Project'}</title>
      </Head>

      <div className="fixed inset-0 bg-gray-100">

        <PinDetailModal 
          pin={pin}
          isOpen={true} 
          onClose={() => router.push('/')}
        />
      </div>
    </>
  );
}