// client/src/pages/users/[id].js
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContexts';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileContent from '../../components/profile/ProfileContent';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getUserProfile, followUser } from '../../lib/api/profile'; 
import PinDetailModal from '../../components/pins/PinDetailModal';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const router = useRouter();
  const { id: userId } = router.query;
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pins'); 
  const [selectedPin, setSelectedPin] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const data = await getUserProfile(userId);
        setProfileUser(data);

        if (data.profile_default_tab) {
          setActiveTab(data.profile_default_tab);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Gagal memuat profil pengguna.');
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId, router]);

  const handleOpenPinDetail = useCallback((pin) => {
    setSelectedPin(pin);
  }, []);

  const handleClosePinDetail = useCallback(() => {
    setSelectedPin(null);
  }, []);

  const handleUpdateUser = useCallback(async (optimisticUser) => {
    if (!profileUser || !currentUser) return;

    const originalUser = { ...profileUser };
    
    setProfileUser(optimisticUser);

    try {

      await followUser(profileUser.id);

    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast.error('Terjadi kesalahan. Mengembalikan aksi.');

      setProfileUser(originalUser);
    }
  }, [profileUser, currentUser]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profileUser) {

    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Profil tidak ditemukan</h1>
        <p className="text-gray-600">Pengguna yang Anda cari mungkin tidak ada.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <ProfileHeader 
        user={profileUser} 
        isCurrentUser={currentUser?.id === profileUser.id}

        onUpdateUser={handleUpdateUser} 
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          <div className="w-full lg:w-1/4 lg:sticky lg:top-24">
            <ProfileSidebar 
              user={profileUser} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          </div>
          
          <div className="w-full lg:w-3/4">
            <ProfileContent 
              userId={profileUser.id} 
              activeTab={activeTab} 
              onPinClick={handleOpenPinDetail}
            />
          </div>

        </div>
      </div>

      {selectedPin && (
        <PinDetailModal 
          pin={selectedPin}
          isOpen={!!selectedPin}
          onClose={handleClosePinDetail}
        />
      )}
    </div>
  );
}