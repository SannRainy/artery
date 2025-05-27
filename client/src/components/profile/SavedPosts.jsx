import { useEffect, useState } from 'react';
import api from '../../lib/api';
import PinCard from '../pins/PinCard';

const SavedPosts = ({ userId }) => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const { data } = await api.get(`/users/${userId}/saved-pins`);
        setSavedPosts(data);
      } catch (error) {
        console.error('Error fetching saved posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedPosts();
  }, [userId]);

  if (loading) return <div>Loading saved posts...</div>;
  if (savedPosts.length === 0) return <div>No saved posts yet</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {savedPosts.map((post) => (
        <PinCard key={post.id} pin={post} />
      ))}
    </div>
  );
};

export default SavedPosts;