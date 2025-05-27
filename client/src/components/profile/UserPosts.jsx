import { useEffect, useState } from 'react';
import api from '../../lib/api';
import PinCard from '../pins/PinCard'; // Anda perlu membuat komponen ini

const UserPosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get(`/users/${userId}/pins`);
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [userId]);

  if (loading) return <div>Loading posts...</div>;
  if (posts.length === 0) return <div>No posts yet</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {posts.map((post) => (
        <PinCard key={post.id} pin={post} />
      ))}
    </div>
  );
};

export default UserPosts;