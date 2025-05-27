import { useEffect, useState } from 'react';
import api from '../../lib/api';
import PinCard from '../pins/PinCard';

const LikedPosts = ({ userId }) => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const { data } = await api.get(`/users/${userId}/liked-pins`);
        setLikedPosts(data);
      } catch (error) {
        console.error('Error fetching liked posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedPosts();
  }, [userId]);

  if (loading) return <div>Loading liked posts...</div>;
  if (likedPosts.length === 0) return <div>No liked posts yet</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {likedPosts.map((post) => (
        <PinCard key={post.id} pin={post} />
      ))}
    </div>
  );
};

export default LikedPosts;