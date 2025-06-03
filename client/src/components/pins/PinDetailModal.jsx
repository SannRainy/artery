import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContexts';
import { likePin, unlikePin, addComment } from '../../services/pins';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import Button from '../ui/Button';
import Input from '../ui/Input';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function PinDetailModal({ pin, onClose }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(pin.is_liked);
  const [likeCount, setLikeCount] = useState(pin.like_count);
  const [comments, setComments] = useState(pin.comments || []);
  const [commentText, setCommentText] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  const handleLike = async () => {
    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    setIsLiked(!originalIsLiked);
    setLikeCount(originalIsLiked ? originalLikeCount - 1 : originalLikeCount + 1);

    try {
      if (originalIsLiked) {
        await unlikePin(pin.id);
      } else {
        await likePin(pin.id);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
      // Anda mungkin ingin menampilkan notifikasi error ke pengguna di sini
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    const originalCommentText = commentText;
    const tempId = `temp_${Date.now()}`;
    const optimisticComment = {
      id: tempId,
      user: { // Menggunakan struktur yang mirip dengan pin.user
        username: user.username,
        avatar_url: user.avatar_url || '/images/default-avatar.jpg',
      },
      text: commentText,
      // Tambahkan properti lain yang mungkin dimiliki objek comment dari backend jika diperlukan untuk UI
      // Misalnya, jika comment memiliki properti `username` dan `avatar_url` secara langsung, bukan nested:
      username: user.username, // Sesuaikan ini jika struktur data comment berbeda
      avatar_url: user.avatar_url || '/images/default-avatar.jpg', // Sesuaikan ini
    };

    setComments(prevComments => [...prevComments, optimisticComment]);
    setCommentText('');

    try {
      const newComment = await addComment(pin.id, originalCommentText);
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === tempId ? { ...newComment, user: newComment.user } : comment // Pastikan struktur user konsisten
        )
      );
    } catch (err) {
      console.error('Error adding comment:', err);
      setComments(prevComments => prevComments.filter(comment => comment.id !== tempId));
      setCommentText(originalCommentText);
      // Anda mungkin ingin menampilkan notifikasi error ke pengguna di sini
    }
  };

  const getHostnameFromUrl = (url) => {
    if (!url) return '';
    try {
      return new URL(url).hostname;
    } catch (e) {
      console.warn('Invalid link_url for hostname extraction:', url);
      // Fallback jika URL tidak valid, tampilkan bagian awal URL
      const displayUrl = url.replace(/^https?:\/\//, '');
      return displayUrl.length > 30 ? `${displayUrl.substring(0, 27)}...` : displayUrl;
    }
  };


  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pinDetailModalTitle"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h2 id="pinDetailModalTitle" className="text-2xl font-bold">{pin.title}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <img
                  src={pin.image_url?.startsWith('/uploads/') ? `${BASE_URL}${pin.image_url}` : (pin.image_url || '/img/default-pin.png')}
                  alt={pin.title}
                  className="w-full h-auto rounded-lg object-contain max-h-[70vh]"
                />
              </div>

              <div className="md:w-1/3 space-y-4 flex flex-col">
                <div className="flex items-center space-x-2">
                  <img
                    src={pin.user?.avatar_url?.startsWith('/uploads/') ? `${BASE_URL}${pin.user.avatar_url}` : (pin.user?.avatar_url || '/images/default-avatar.jpg')}
                    alt={pin.user?.username || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{pin.user?.username}</span>
                </div>

                {pin.description && (
                  <p className="text-gray-700">{pin.description}</p>
                )}

                {pin.link_url && (
                  <a
                    href={pin.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline block break-all"
                  >
                    {getHostnameFromUrl(pin.link_url)}
                  </a>
                )}

                <div className="flex space-x-4 items-center">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500'}`}
                    disabled={!user}
                    aria-pressed={isLiked}
                  >
                    {isLiked ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart className="text-gray-500" />
                    )}
                    <span>{likeCount}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <FaComment className="text-gray-500" />
                    <span>{comments.length}</span>
                  </div>
                </div>

                <div className="border-t pt-4 flex-grow flex flex-col min-h-0">
                  <h3 className="font-medium mb-2">Comments</h3>
                  <div className="space-y-3 max-h-48 md:max-h-60 overflow-y-auto flex-grow mb-3 pr-2">
                    {comments.length > 0 ? comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-2">
                        <img
                          src={comment.user?.avatar_url?.startsWith('/uploads/') ? `${BASE_URL}${comment.user.avatar_url}` : (comment.user?.avatar_url || '/images/default-avatar.jpg')}
                          alt={comment.user?.username || 'User'}
                          className="w-8 h-8 rounded-full mt-1"
                        />
                        <div>
                          <p className="font-medium text-sm">{comment.user?.username || 'Anonymous'}</p>
                          <p className="text-sm break-words">{comment.text}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500">No comments yet.</p>
                    )}
                  </div>

                  {user && (
                    <form onSubmit={handleCommentSubmit} className="mt-auto">
                      <div className="flex space-x-2 items-center">
                         <img
                            src={user.avatar_url?.startsWith('/uploads/') ? `${BASE_URL}${user.avatar_url}` : (user.avatar_url || '/images/default-avatar.jpg')}
                            alt={user.username}
                            className="w-8 h-8 rounded-full"
                          />
                        <Input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1"
                          aria-label="Add a comment"
                        />
                        <Button type="submit" disabled={!commentText.trim()}>Post</Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}