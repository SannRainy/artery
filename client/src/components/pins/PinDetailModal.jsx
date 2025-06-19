// client/src/components/pins/PinDetailModal.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContexts';
import { getPinById, addComment, likePin } from '../../services/pins';
import { followUser } from '../../lib/api/profile';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../ui/LoadingSpinner';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify'; 

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function PinDetailModal({ pin: initialPin, isOpen, onClose }) {
  const { user } = useAuth();
  
  const [pin, setPin] = useState(initialPin);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !initialPin?.id) return;

    const fetchPinDetails = async () => {
      setLoading(true);
      try {
        const fullPinData = await getPinById(initialPin.id);
        setPin(fullPinData);

        if (user && fullPinData.user) {
          setIsFollowing(fullPinData.user.is_following || false);
        }

      } catch (error) {
        console.error("Gagal memuat detail pin:", error);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchPinDetails();
  }, [initialPin, isOpen, onClose, user]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pin?.comments]);

  const handleAction = useCallback(async (action) => {
    if (!user) return;
    try {
      await action();
    } catch (err) {
      console.error("Gagal melakukan aksi:", err);

    }
  }, [user]);

  const handleLike = () => {
    const originalPin = { ...pin };
    setPin(p => ({
      ...p,
      is_liked: !p.is_liked,
      like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1,
    }));
    handleAction(() => likePin(pin.id)).catch(() => setPin(originalPin));
  };

   const handleFollow = useCallback(async () => {
    let isCurrentlyFollowing = isFollowing;
    if (!user) {
      toast.info("Silakan login untuk mengikuti pengguna.");
      return;
    }
    if (!pin || !pin.user || !pin.user.id) {
      toast.error("Informasi pengguna pin tidak tersedia.");
      return;
    }
    if (user.id === pin.user.id) {
      return;
    }

    setIsFollowing(!isCurrentlyFollowing); 

    try {
      await followUser(pin.user.id);

      const message = !isCurrentlyFollowing
        ? `Anda sekarang mengikuti ${pin.user.username}.`
        : `Anda berhenti mengikuti ${pin.user.username}.`;
      toast.success(message);
    } catch (error) {
      console.error("Gagal follow/unfollow:", error); 
      toast.error("Terjadi kesalahan saat mengubah status mengikuti."); 
      setIsFollowing(isCurrentlyFollowing); 
    }
  }, [user, pin, isFollowing]); 

  const handleUnfollow = useCallback(async () => {
    if (!user || !pin || !pin.user || !pin.user.id || user.id === pin.user.id) return;

    const originalIsFollowing = isFollowing;
    setIsFollowing(false); 

    try {
      await followUser(pin.user.id); 
      toast.success(`Anda berhenti mengikuti ${pin.user.username}.`);
    } catch (error) {
      console.error("Gagal berhenti mengikuti pengguna:", error);
      toast.error("Terjadi kesalahan saat berhenti mengikuti pengguna.");
      setIsFollowing(originalIsFollowing); 
    }
  }, [user, pin, isFollowing]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newComment = await addComment(pin.id, commentText);
      setPin(p => ({
        ...p,
        comments: [...(p.comments || []), newComment],
        comment_count: (p.comment_count || 0) + 1,
      }));
      setCommentText('');
    } catch (err) {
      console.error("Gagal menambah komentar:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  let currentUserAvatar = user?.avatar_url 
    ? (user.avatar_url.startsWith('/uploads/') ? `${BASE_URL}${user.avatar_url}` : user.avatar_url)
    : '/img/default-avatar.png';

  return (
    
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      
      
      <div className="relative w-full h-full max-w-6xl max-h-full p-4 md:p-8 lg:p-12">
        
        <div 
          className="relative bg-white rounded-3xl shadow-2xl w-full h-full flex flex-col md:flex-row overflow-hidden"
          onClick={(e) => e.stopPropagation()} 
        >
          
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 z-10 p-2 rounded-full bg-white/50 hover:bg-gray-200 hover:text-gray-900 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          {loading || !pin ? (
            <div className="flex w-full h-full justify-center items-center"><LoadingSpinner /></div>
          ) : (
            <>
              
              <div className="w-full md:w-1/2 bg-gray-100 flex-shrink-0">
                <div className="relative w-full h-full">
                  <Image
                    src={pin.image_url?.startsWith('/uploads/') ? `${BASE_URL}${pin.image_url}` : (pin.image_url || '/img/default-pin.png')}
                    alt={pin.title || "Pin image"}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-l-3xl"
                  />
                </div>
              </div>

              
              <div className="w-full md:w-1/2 p-6 flex flex-col">
                
                <div className="flex-shrink-0 pb-4 border-b border-gray-200">
                  <h1 className="text-3xl font-bold text-gray-900 break-words pr-8">{pin.title}</h1>
                  {pin.description && <p className="text-gray-600 mt-2 text-sm break-words">{pin.description}</p>}
                  <div className="flex justify-between items-center mt-6">
                    <Link href={`/users/${pin.user.id}`} className="flex items-center space-x-3 group">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={pin.user.avatar_url?.startsWith('/uploads/') ? `${BASE_URL}${pin.user.avatar_url}` : (pin.user.avatar_url || '/img/default-avatar.png')}
                          alt={pin.user.username} layout="fill" objectFit="cover"
                        />
                      </div>
                      <p className="font-semibold text-sm text-gray-800 group-hover:underline">{pin.user.username}</p>
                    </Link>
                    {user && user.id !== pin.user.id && (
                      <button
                        onClick={isFollowing ? handleUnfollow : handleFollow}
                        className={`font-semibold py-2 px-4 rounded-full text-sm transition-colors ${
                          isFollowing ? 'bg-gray-200 text-black' : 'bg-primary text-white'
                        }`}
                      >
                        {isFollowing ? 'Diikuti' : 'Ikuti'}
                      </button>
                    )}
                  </div>
                </div>

                
                <div className="flex-grow my-4 overflow-y-auto pr-2 space-y-5">
                  <h2 className="font-semibold text-md sticky top-0 bg-white py-2">Komentar</h2>
                  {pin.comments?.length > 0 ? pin.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={comment.user.avatar_url?.startsWith('/uploads/') ? `${BASE_URL}${comment.user.avatar_url}` : (comment.user.avatar_url || '/img/default-avatar.png')}
                          alt={comment.user.username} layout="fill" objectFit="cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p>
                          <Link href={`/users/${comment.user.id}`} className="font-semibold text-sm mr-2 hover:underline">{comment.user.username}</Link>
                          <span className="text-sm text-gray-800">{comment.text}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(comment.created_at)}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500">Belum ada komentar.</p>
                  )}
                  <div ref={commentsEndRef} />
                </div>

                {user && (
                  <div className="flex-shrink-0 mt-auto pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-lg font-bold">{pin.like_count || 0} Suka</p>
                      <button onClick={handleLike} className="p-2 rounded-full hover:bg-gray-100">
                        {pin.is_liked ? <FaHeart className="text-red-500 h-6 w-6" /> : <FaRegHeart className="h-6 w-6 text-gray-600" />}
                      </button>
                    </div>
                    <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image src={currentUserAvatar} alt="Avatar Anda" layout="fill" objectFit="cover"/>
                      </div>
                      <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Tambahkan komentar..."
                        className="flex-1 bg-gray-100 border-none rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        disabled={isSubmitting}
                      />
                      <button type="submit" disabled={!commentText.trim() || isSubmitting} className="p-2 text-primary rounded-full hover:bg-gray-100 disabled:text-gray-300">
                        <PaperAirplaneIcon className="h-6 w-6"/>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}