import { useState, useEffect } from 'react';
import { getUserPins, getUserBoards, getUserActivity } from '../../lib/api/profile';
import UserPins from './UserPins';
import UserBoards from './UserBoards';
import UserActivity from './UserActivity';

const ProfileContent = ({ userId, activeTab }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        let data;
        
        switch (activeTab) {
          case 'pins':
            data = await getUserPins(userId);
            break;
          case 'boards':
            data = await getUserBoards(userId);
            break;
          case 'activity':
            data = await getUserActivity(userId);
            break;
          default:
            data = await getUserPins(userId);
        }
        
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [userId, activeTab]);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {activeTab === 'pins' && <UserPins pins={content} />}
      {activeTab === 'boards' && <UserBoards boards={content} />}
      {activeTab === 'activity' && <UserActivity activities={content} />}
    </div>
  );
};

export default ProfileContent;