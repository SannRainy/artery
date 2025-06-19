// File: src/pages/settings/[tab].jsx

import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContexts';

import SettingsSidebar from '../../components/settings/SettingsSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

import EditProfileForm from '../../components/profile/EditProfileForm';
import AccountSettings from '../../components/settings/AccountSettings'; 
import Preferences from '../../components/settings/Preferences';    
import Privacy from '../../components/settings/Privacy';           

function SettingsPageLayout({ user, activeTab, children }) {

  return (
    <>
      <Head>
        <title>{`Pengaturan ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`} | Artery Project</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <Link
                href={`/users/${user.id}`}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Kembali ke profil"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
            </div>
            <p className="text-gray-500 ml-14">Kelola informasi profil dan preferensi akun Anda.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <div className="w-full md:w-1/4">
              <SettingsSidebar active={activeTab} />
            </div>
            <div className="w-full md:w-3/4">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default function DynamicSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { tab } = router.query;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?returnUrl=/settings/profile`);
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || !tab) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  const renderContent = () => {
    switch (tab) {
      case 'profile':
        return <EditProfileForm currentUser={user} onProfileUpdated={refreshUser} />;
      case 'account':
        return <AccountSettings />;
      case 'preference':
        return <Preferences />;
      case 'privacy':
        return <Privacy />;
      default:

        router.replace('/settings/profile');
        return null;
    }
  };

  return (
    <SettingsPageLayout user={user} activeTab={tab}>
      {renderContent()}
    </SettingsPageLayout>
  );
}