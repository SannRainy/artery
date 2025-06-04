// client/src/components/pins/PinCard.jsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContexts';
import { likePin } from '../../services/pins';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function PinCard({ pin }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(pin?.is_liked || false);
  const [likeCount, setLikeCount] = useState(pin?.like_count || 0);

  useEffect(() => {
    setIsLiked(pin?.is_liked || false);
    setLikeCount(pin?.like_count || 0);
  }, [pin?.is_liked, pin?.like_count]);

  const handleLike = async (e) => {
    e.stopPropagation(); 
    e.preventDefault();  

    if (!user) return;

    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    setIsLiked(!originalIsLiked);
    setLikeCount(prevCount => originalIsLiked ? prevCount - 1 : prevCount + 1);

    try {
      const response = await likePin(pin.id); 

      if (response && typeof response.liked === 'boolean' && typeof response.new_like_count === 'number') {
        setIsLiked(response.liked);
        setLikeCount(response.new_like_count);
      } else {
        console.warn("Like/unlike response did not contain expected data.");
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setIsLiked(originalIsLiked); 
      setLikeCount(originalLikeCount);
    }
  };

  if (!pin) return null;
  const pinUser = pin.user || {};

  return (
    <div className="mb-6 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
      
      <Link href={`/pins/${pin.id}`} className="relative cursor-zoom-in block">
        <img
          src={pin.image_url?.startsWith('/uploads/') ? `${BASE_URL}${pin.image_url}` : (pin.image_url || '/img/default-pin.png')}
          alt={pin.title || 'Pin image'}
          className="w-full h-auto object-cover aspect-[3/4]"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex flex-col justify-end p-3">
          <h3 className="text-white font-semibold text-md drop-shadow-md line-clamp-2">{pin.title}</h3>
        </div>
      </Link>

      <div className="p-3">
        {pin.tags && pin.tags.length > 0 && (
            <div className="flex items-center space-x-1 flex-wrap mb-2">
              {pin.tags.slice(0, 2).map((tag) => (
                tag && tag.name && <span key={tag.id} className="text-xs text-gray-500 hover:text-primary">
                  #{tag.name}
                </span>
              ))}
              {pin.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{pin.tags.length - 2}</span>
              )}
            </div>
          )}

        <div className="flex justify-between items-center">
          
          <Link href={`/users/${pin.user_id || pinUser.id}`} className="flex items-center space-x-2 group">
            <img
              src={pinUser.avatar_url?.startsWith('/uploads/') ? `${BASE_URL}${pinUser.avatar_url}` : (pinUser.avatar_url || '/img/default-avatar.png')}
              alt={pinUser.username || 'User avatar'}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-gray-700 group-hover:text-primary">{pinUser.username || 'Anonymous'}</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center space-x-1 ${!user ? 'opacity-50 cursor-not-allowed' : 'text-gray-500 hover:text-red-500'}`}
              aria-pressed={isLiked}
              title={isLiked ? "Unlike" : "Like"}
            >
              {isLiked ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart />
              )}
              <span className="text-xs">{likeCount}</span>
            </button>

            {/* PERUBAHAN 3: Hilangkan legacyBehavior dan <a> wrapper */}
            <Link href={`/pins/${pin.id}#comments`} className="flex items-center space-x-1 text-gray-500 hover:text-primary">
              <FaComment />
              <span className="text-xs">{pin.comment_count || 0}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}