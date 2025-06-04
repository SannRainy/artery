// client/src/pages/settings/profile.js
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContexts';
import EditProfileForm from '../../components/profile/EditProfileForm'; // Komponen ini akan kita buat
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  useEffect(() => {
    // Jika auth selesai loading dan tidak ada user, redirect ke login
    if (!authLoading && !user) {
      router.replace('/login?returnUrl=/settings/profile');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Profile | Artery Project</title>
      </Head>
      {/* Anda bisa menggunakan layout yang sama dengan halaman lain jika ada */}
      {/* <Header onCreateClick={() => router.push('/pins/create')} />  Contoh jika Header punya prop ini */}
      
      <main className="container mx-auto px-4 py-8 pt-24 md:pt-20"> {/* Sesuaikan padding atas jika ada header fixed */}
        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 shadow-lg rounded-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
            Edit Profile
          </h1>
          <EditProfileForm currentUser={user} onProfileUpdated={refreshUser} />
        </div>
      </main>
    </>
  );
}