// client/src/components/pins/PinCard.jsx
import { useState, useEffect, forwardRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContexts';
import { likePin } from '../../services/pins';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { useInView } from '../../hooks/useInView'; // Asumsi hook ini sudah dibuat

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const PinCard = forwardRef(({ pin, index }, ref) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(pin?.is_liked || false);
  const [likeCount, setLikeCount] = useState(pin?.like_count || 0);
  const [aspectRatio, setAspectRatio] = useState(3 / 4);

  const [animationRef, isInView] = useInView({ threshold: 0.1, triggerOnce: true });

  const setRefs = useCallback(
    (node) => {
      animationRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [animationRef, ref]
  );

  useEffect(() => {
    setIsLiked(pin?.is_liked || false);
    setLikeCount(pin?.like_count || 0);

    if (pin?.image_url) {
      const img = new Image();
      const imageUrl = pin.image_url.startsWith('/uploads/') 
        ? `${BASE_URL}${pin.image_url}` 
        : pin.image_url;
      
      img.src = imageUrl;
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          setAspectRatio(img.naturalWidth / img.naturalHeight);
        }
      };
      img.onerror = () => setAspectRatio(3 / 4);
    }
  }, [pin]);

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

    <div
      ref={setRefs}
      className={`transition-all duration-700 ease-out ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${(index % 20) * 50}ms` }}
    >

      <div className="cursor-zoom-in rounded-lg overflow-hidden shadow-md hover:shadow-lg bg-white">
        
        <div className="relative">
          <div className="w-full bg-gray-100" style={{ aspectRatio: aspectRatio }}>
            <img
              src={pin.image_url?.startsWith('/uploads/') ? `${BASE_URL}${pin.image_url}` : (pin.image_url || '/img/default-pin.png')}
              alt={pin.title || 'Pin image'}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex flex-col justify-end p-3">
            <h3 className="text-white font-semibold text-md drop-shadow-md line-clamp-2">{pin.title}</h3>
          </div>
        </div>

        <div className="p-3">
          {pin.tags && pin.tags.length > 0 && (
            <div className="flex items-center space-x-1 flex-wrap mb-2">
              {pin.tags.slice(0, 2).map((tag) => (
                tag && tag.name && <span key={tag.id} className="text-xs text-gray-500 hover:text-primary">#{tag.name}</span>
              ))}
              {pin.tags.length > 2 && <span className="text-xs text-gray-500">+{pin.tags.length - 2}</span>}
            </div>
          )}
          <div className="flex justify-between items-center">

            <div className="flex items-center space-x-2 group">
              <img
                src={pinUser.avatar_url?.startsWith('/uploads/') ? `${BASE_URL}${pinUser.avatar_url}` : (pinUser.avatar_url || '/img/default-avatar.png')}
                alt={pinUser.username || 'User avatar'}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-medium text-gray-700 group-hover:text-primary">{pinUser.username || 'Anonymous'}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button onClick={handleLike} disabled={!user} className={`flex items-center space-x-1 ${!user ? 'opacity-50' : 'text-gray-500 hover:text-red-500'}`}>
                {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                <span className="text-xs">{likeCount}</span>
              </button>
              <div className="flex items-center space-x-1 text-gray-500">
                <FaComment />
                <span className="text-xs">{pin.comment_count || 0}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

PinCard.displayName = 'PinCard';
export default PinCard;