// client/src/components/profile/ProfileContent.jsx
import { useState, useEffect } from 'react';
import { getUserPins, getUserActivity } from '../../lib/api/profile';
import UserPins from './UserPins';
import UserActivity from './UserActivity';
import LoadingSpinner from '../ui/LoadingSpinner'; // Tambahkan Loading Spinner

const ProfileContent = ({ userId, activeTab, onPinClick }) => { // <-- Terima prop onPinClick
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        let data;
        
        if (activeTab === 'pins') {
          data = await getUserPins(userId);
        } else if (activeTab === 'activity') {
          data = await getUserActivity(userId);
        } else {
          data = await getUserPins(userId);
        }
        
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchContent();
    }
  }, [userId, activeTab]);

  if (loading) return <div className="text-center py-8"><LoadingSpinner /></div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      {/* Kirim onPinClick ke UserPins */}
      {activeTab === 'pins' && <UserPins pins={content} onPinClick={onPinClick} />}
      {activeTab === 'activity' && <UserActivity activities={content} />}
    </div>
  );
};

export default ProfileContent;