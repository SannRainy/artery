// client/src/components/pins/PinDetailModal.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContexts';
import { likePin, unlikePin, addComment } from '../../services/pins'; // Pastikan addComment ada dan berfungsi
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import Button from '../ui/Button';
import Input from '../ui/Input'; // Asumsi Input adalah komponen UI kustom Anda

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function PinDetailModal({ pin, onClose, isOpen }) { // Tambahkan isOpen sebagai prop
  const { user } = useAuth();
  
  const [isLiked, setIsLiked] = useState(pin?.is_liked || false);
  const [likeCount, setLikeCount] = useState(pin?.like_count || 0);
  const [comments, setComments] = useState(pin?.comments || []);
  const [commentText, setCommentText] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    if (pin) {
      setIsLiked(pin.is_liked || false);
      setLikeCount(pin.like_count || 0);
      setComments(pin.comments || []);
    }
  }, [pin]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
    // Membersihkan input komentar saat modal ditutup atau pin berubah
    if (!isOpen) {
        setCommentText('');
    }
  }, [isOpen]);

  const handleLike = async () => {
    if (!user) return;

    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    setIsLiked(!originalIsLiked);
    setLikeCount(prevCount => originalIsLiked ? prevCount - 1 : prevCount + 1);

    try {
      // Menggunakan fungsi likePin yang sama karena server POST /:pinId/like sekarang adalah toggle
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
      // Tampilkan notifikasi error
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    const optimisticComment = {
      id: `temp_${Date.now()}`,
      user: { 
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url || '/images/default-avatar.jpg', // Fallback avatar
      },
      text: commentText.trim(),
      created_at: new Date().toISOString(),
    };

    setComments(prevComments => [...prevComments, optimisticComment]);
    const tempCommentText = commentText; // Simpan untuk rollback jika perlu
    setCommentText('');

    try {
      const newCommentFromServer = await addComment(pin.id, tempCommentText.trim());
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === optimisticComment.id ? { ...newCommentFromServer, user: newCommentFromServer.user || optimisticComment.user } : comment 
        )
      );
    } catch (err) {
      console.error('Error adding comment:', err);
      setComments(prevComments => prevComments.filter(comment => comment.id !== optimisticComment.id));
      setCommentText(tempCommentText); // Kembalikan teks jika gagal
      // Tampilkan notifikasi error
    }
  };
  
  if (!isOpen || !pin) return null;

  const pinUser = pin.user || {};
  const pinCommentsToDisplay = comments || [];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pinDetailModalTitle"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose}></div>

      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        {/* Ini untuk trik vertical centering */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Konten Modal */}
          <div className="p-1 md:p-2"> {/* Padding lebih kecil untuk memberi ruang pada konten */}
            <div className="flex flex-col md:flex-row gap-0 md:gap-2 max-h-[calc(90vh-4rem)]"> {/* Batasi tinggi modal */}
              {/* Kolom Gambar */}
              <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-100 rounded-l-lg overflow-hidden">
                <img
                  src={pin.image_url?.startsWith('/uploads/') ? `${BASE_URL}${pin.image_url}` : (pin.image_url || '/img/default-pin.png')}
                  alt={pin.title || "Pin image"}
                  className="object-contain w-full h-full max-h-[80vh] md:max-h-none" // Biarkan gambar mengisi kontainer
                />
              </div>

              {/* Kolom Detail */}
              <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 id="pinDetailModalTitle" className="text-xl md:text-2xl font-bold text-gray-900">{pin.title}</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                
                {pin.description && (
                  <p className="text-gray-700 mb-4 text-sm">{pin.description}</p>
                )}

                {/* link_url sudah dihapus */}

                <div className="flex items-center space-x-2 mb-4">
                  <img
                    src={pinUser.avatar_url?.startsWith('/uploads/') ? `${BASE_URL}${pinUser.avatar_url}` : (pinUser.avatar_url || '/images/default-avatar.jpg')}
                    alt={pinUser.username || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-sm">{pinUser.username || 'Anonymous'}</span>
                </div>

                <div className="flex space-x-4 items-center mb-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 text-sm ${!user ? 'opacity-50 cursor-not-allowed' : 'text-gray-600 hover:text-red-500'}`}
                    disabled={!user}
                    aria-pressed={isLiked}
                  >
                    {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    <span>{likeCount}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <FaComment />
                    <span>{pinCommentsToDisplay.length}</span>
                  </div>
                </div>

                {/* Bagian Komentar */}
                <div className="flex-grow overflow-y-auto border-t pt-4 min-h-[150px]"> {/* min-h untuk memastikan area komentar terlihat */}
                  <h3 className="font-semibold text-gray-800 mb-3 text-md">Comments</h3>
                  <div className="space-y-3 mb-4">
                    {pinCommentsToDisplay.length > 0 ? pinCommentsToDisplay.map((comment) => (
                      comment && comment.user &&
                      <div key={comment.id} className="flex space-x-2 items-start">
                        <img
                          src={comment.user.avatar_url?.startsWith('/uploads/') ? `${BASE_URL}${comment.user.avatar_url}` : (comment.user.avatar_url || '/images/default-avatar.jpg')}
                          alt={comment.user.username || 'User'}
                          className="w-7 h-7 rounded-full mt-1"
                        />
                        <div className="bg-gray-100 p-2 rounded-lg flex-1">
                          <p className="font-medium text-xs text-gray-800">{comment.user.username || 'Anonymous'}</p>
                          <p className="text-xs text-gray-700 break-words">{comment.text}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-gray-500">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                </div>
                
                {/* Form Komentar */}
                {user && (
                  <form onSubmit={handleCommentSubmit} className="mt-auto border-t pt-4">
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
                        className="flex-1 !mt-0" // Override margin jika ada dari Input
                        aria-label="Add a comment"
                      />
                      <Button type="submit" disabled={!commentText.trim()} className="py-2">Post</Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}