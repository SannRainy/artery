// client/src/components/pins/PinCard.jsx
import { useState, useEffect, forwardRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContexts';
import { toggleLikePin } from '../../services/pins';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { useInView } from '../../hooks/useInView';
import { getImageUrl } from '../../utils/helpers';
import Image from 'next/image';

const PinCard = forwardRef(({ pin, index }, ref) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(pin?.is_liked || false);
  const [likeCount, setLikeCount] = useState(pin?.like_count || 0);
  const [aspectRatio, setAspectRatio] = useState(3 / 4); // Default aspect ratio

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
  }, [pin.is_liked, pin.like_count]); 

  const handleLike = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) return;

    setIsLiked(prev => !prev);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));

    try {
      const response = await toggleLikePin(pin.id);
      if (response ){ 
        onPinUpdate({
          id: pin.id,
          is_liked: response.liked,
          like_count: response.new_like_count,
        });
      }
    } catch (err) {
      setIsLiked(pin.is_liked);
      setLikeCount(pin.like_count);
      console.error('Error toggling like:', err);
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
      <div className="group cursor-zoom-in rounded-2xl overflow-hidden bg-white relative shadow-sm hover:shadow-lg transition-shadow">
        <div className="relative">

          <Image
            src={getImageUrl(pin.image_url)}
            alt={pin.title || 'Pin image'}
            width={500}
            height={500}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-auto object-cover"
            onLoad={({ target }) => {
              const { naturalWidth, naturalHeight } = target;
              if (naturalWidth > 0 && naturalHeight > 0) {
                 setAspectRatio(naturalWidth / naturalHeight);
              }
            }}
            style={{ aspectRatio: aspectRatio }}
          />
          {/* -------------------------------------------------------- */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
             <h3 className="text-white font-semibold text-md drop-shadow-md line-clamp-2">{pin.title}</h3>
          </div>
        </div>

        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 group">
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={getImageUrl(pinUser.avatar_url, '/img/default-avatar.png')}
                    alt={pinUser.username || 'User avatar'}
                    layout="fill"
                    objectFit="cover"
                  />
              </div>
              <span className="text-xs font-medium text-gray-700">{pinUser.username || 'Anonymous'}</span>
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