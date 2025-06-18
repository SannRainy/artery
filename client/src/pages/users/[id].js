// client/src/pages/users/[id].js
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContexts';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileContent from '../../components/profile/ProfileContent';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getUserProfile, followUser as followUserService } from '../../lib/api/profile';
import PinDetailModal from '../../components/pins/PinDetailModal';

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pins');
  const [selectedPin, setSelectedPin] = useState(null);
  
  const handleOpenPinDetail = useCallback((pin) => {
    setSelectedPin(pin);
  }, []);

  const handleClosePinDetail = useCallback(() => {
    setSelectedPin(null);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getUserProfile(id);
        setProfileUser(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [id, router]);

  const handleFollowToggle = useCallback(async () => {
    if (!profileUser || !currentUser || profileUser.id === currentUser.id) return;

    const originalIsFollowing = profileUser.is_following;
    // Follower count di server tidak dikembalikan langsung oleh endpoint follow,
    // jadi kita akan update secara optimis di client atau perlu refetch profile.
    // Untuk saat ini, kita update optimis.
    const originalFollowersCount = profileUser.followersCount; 

    setProfileUser(prevUser => ({
      ...prevUser,
      is_following: !prevUser.is_following,
      followersCount: prevUser.is_following 
        ? (prevUser.followersCount || 0) - 1 
        : (prevUser.followersCount || 0) + 1,
    }));

    try {
      const response = await followUserService(profileUser.id);
      setProfileUser(prevUser => ({
        ...prevUser,
        is_following: response.following,
        // Jika server mengembalikan followersCount baru, gunakan itu:
        // followersCount: response.newFollowersCount || prevUser.followersCount
      }));
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      setProfileUser(prevUser => ({ // Revert
        ...prevUser,
        is_following: originalIsFollowing,
        followersCount: originalFollowersCount,
      }));
    }
  }, [profileUser, currentUser, setProfileUser]);

  if (loading || !profileUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <ProfileHeader 
        user={profileUser} 
        isCurrentUser={currentUser?.id === profileUser.id}
        onFollowToggle={handleFollowToggle} // Teruskan callback
      />
      
      {/* === PERUBAHAN UTAMA DI SINI === */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 lg:sticky lg:top-24">
            <ProfileSidebar 
              user={profileUser} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          </div>
          
          {/* Konten Utama (Pins, Activity, etc) */}
          <div className="w-full lg:w-3/4">
            <ProfileContent 
              userId={profileUser.id} 
              activeTab={activeTab} 
              onPinClick={handleOpenPinDetail}
            />
          </div>

        </div>
      </div>
      {/* === AKHIR PERUBAHAN === */}

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