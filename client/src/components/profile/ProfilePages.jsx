import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContexts';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';
import ProfileSidebar from './ProfileSidebar';
import LoadingSpinner from '../ui/LoadingSpinner';
import api from '../../lib/api';

const ProfilePage = ({ userData }) => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(userData);
  const [loading, setLoading] = useState(!userData);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (!userData) {
      const fetchUser = async () => {
        try {
          const { data } = await api.get(`/users/${id}`);
          setProfileUser(data);
        } catch (error) {
          console.error('Error fetching user:', error);
          router.push('/404');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, userData, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <ProfileHeader user={profileUser} isCurrentUser={user?.id === profileUser.id} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <ProfileSidebar user={profileUser} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="md:w-3/4">
            <ProfileContent user={profileUser} activeTab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );
};  

export default ProfilePage;