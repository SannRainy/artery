import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContexts';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileContent from '../../components/profile/ProfileContent';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getUserProfile } from '../../lib/api/profile'; //.js]

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query; //.js]
  const { user } = useAuth(); //.js]
  const [profileUser, setProfileUser] = useState(null); //.js]
  const [loading, setLoading] = useState(true); //.js]
  const [activeTab, setActiveTab] = useState('pins'); //.js]

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await getUserProfile(id); //.js]
        setProfileUser(data); //.js]
      } catch (error) {
        console.error('Error fetching user profile:', error); //.js]
        router.push('/404'); //.js]
      } finally {
        setLoading(false); //.js]
      }
    };

    if (id) { //.js]
      fetchUserProfile();
    }
  }, [id, router]); //.js]

  if (loading || !profileUser) { //.js]
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