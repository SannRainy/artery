// client/src/pages/settings/[tab].jsx

import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContexts';

// Import komponen
import SettingsSidebar from '../../components/settings/SettingsSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Footer from '../../components/layout/Footer'; 
import { FiLogOut, FiUser } from 'react-icons/fi';

// Import konten tab
import EditProfileForm from '../../components/profile/EditProfileForm';
import LinkedAccounts from '../../components/settings/LinkedAccounts'; 
import Preferences from '../../components/settings/Preferences';    
import PaymentInformation from '../../components/settings/PaymentInformation';
import SafetySettings from '../../components/settings/SafetySettings';
import NotificationSettings from '../../components/settings/NotificationSettings';

// Komponen Layout untuk Halaman Pengaturan
function SettingsPageLayout({ user, activeTab, onLogout, children }) {
  const sidebarItems = [
    { id: 'profile', label: 'Personal details' },
    { id: 'payment', label: 'Payment Information' }, 
    { id: 'safety', label: 'Safety' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'notifications', label: 'Notifications' }
  ];

  return (
    <>
      <Head>
        <title>{`Settings - ${activeTab}`} | Artery</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pt-24">
        <main className="container mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar Kiri */}
            <div className="lg:col-span-3">
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 px-2">Profile settings</h3>
                <nav className="flex flex-col space-y-1">
                    <SettingsSidebar active={activeTab} />
                </nav>
                <div className="border-t my-4"></div>
                <Link
                  href={`/users/${user.id}`}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg font-semibold text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors mb-2"
                >
                  <FiUser className="h-5 w-5" />
                  <span>Kembali ke Profil</span>
                </Link>
                
                <div className="border-t my-4"></div>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg font-semibold text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>

            {/* Konten Kanan */}
            <div className="lg:col-span-9">
              <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-gray-200 min-h-[400px]">
                {children}
              </div>
            </div>
          </div>
          
          {/* Integrasi Footer */}
          <Footer />
        </main>
      </div>
    </>
  );
}

// Komponen Halaman Dinamis
export default function DynamicSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const { tab } = router.query;

  console.log('Current Router Tab:', tab);

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
    const validTabs = ['profile','payment', 'safety', 'preferences', 'notifications', 'passengers', 'account'];
    if (!validTabs.includes(tab)) {
      return <div className="text-center py-10">
        <h3 className="text-xl font-bold">Halaman Pengaturan Tidak Ditemukan</h3>
        <p className="text-gray-500">Silakan pilih menu pengaturan yang valid dari samping.</p>
      </div>;
    }   
    switch (tab) {
      case 'profile':
        return <EditProfileForm currentUser={user} onProfileUpdated={refreshUser} />;
      case 'payment':
        return <PaymentInformation currentUser={user} />;
      case 'safety':
        return <SafetySettings currentUser={user} />;
      case 'preferences':
        return <Preferences currentUser={user} />;
      case 'notifications':
        return <NotificationSettings currentUser={user} />;
      case 'passengers':
        return <LinkedAccounts currentUser={user} />;
      case 'account':
        return <div>Account Settings Page</div>;
       default:
        return <LoadingSpinner />;
    }
  };

  return (
    <SettingsPageLayout user={user} activeTab={tab} onLogout={logout}>
      {renderContent()}
    </SettingsPageLayout>
  );
}