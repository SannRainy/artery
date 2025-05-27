import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContexts';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileContent from '../../components/profile/ProfileContent';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getUserProfile } from '../../lib/api/profile';

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pins');

  useEffect(() => {
    const fetchUserProfile = async () => {
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

    if (id) {
      fetchUserProfile();
    }
  }, [id, router]);

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
        isCurrentUser={user?.id === profileUser.id} 
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <ProfileSidebar 
              user={profileUser} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          </div>
          <div className="md:w-3/4">
            <ProfileContent 
              userId={profileUser.id} 
              activeTab={activeTab} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}