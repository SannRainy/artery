// client/src/pages/settings/profile.js
import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link'; // Import Link
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContexts';
import EditProfileForm from '../../components/profile/EditProfileForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SettingsSidebar from '../../components/settings/SettingsSidebar';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?returnUrl=/settings/profile');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Profil | Artery Project</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        
        <main className="container mx-auto max-w-6xl px-4 py-8">
          
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              
              {/* === PERUBAHAN UTAMA DI SINI === */}
              <Link 
                href={`/users/${user.id}`}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Kembali ke profil"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
              </Link>
              {/* =============================== */}

              <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
            </div>
            <p className="text-gray-500 ml-14">Kelola informasi profil dan preferensi akun Anda.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            
            <div className="w-full md:w-1/4">
              <SettingsSidebar active="profile" />
            </div>

            <div className="w-full md:w-3/4">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                <EditProfileForm currentUser={user} onProfileUpdated={refreshUser} />
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}