// client/src/components/pins/PinCard.jsx
import { useState, useEffect } from 'react'; // useEffect ditambahkan jika state perlu disinkronkan dari prop pin yang berubah
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContexts';
import { likePin, unlikePin } from '../../services/pins'; // Pastikan path dan fungsi ini benar
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function PinCard({ pin }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(pin?.is_liked || false);
  const [likeCount, setLikeCount] = useState(pin?.like_count || 0);

  // Sinkronisasi state jika prop pin berubah (misalnya, setelah data di-refresh di parent)
  useEffect(() => {
    setIsLiked(pin?.is_liked || false);
    setLikeCount(pin?.like_count || 0);
  }, [pin?.is_liked, pin?.like_count]);


  const handleLike = async (e) => {
    e.stopPropagation(); // Mencegah navigasi jika tombol ada di dalam Link
    e.preventDefault();  // Mencegah perilaku default jika di dalam anchor

    if (!user) return;

    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    // Optimistic UI update
    setIsLiked(!originalIsLiked);
    setLikeCount(prevCount => originalIsLiked ? prevCount - 1 : prevCount + 1);

    try {
      // API call sekarang akan menggunakan POST /pins/:pinId/like yang bersifat toggle
      const response = await likePin(pin.id); // atau bisa juga buat fungsi toggleLike(pin.id) di service

      // Update state dari respons server untuk memastikan konsistensi
      if (response && typeof response.liked === 'boolean' && typeof response.new_like_count === 'number') {
        setIsLiked(response.liked);
        setLikeCount(response.new_like_count);
      } else {
        // Jika respons tidak sesuai, rollback atau refresh data pin
        console.warn("Like/unlike response did not contain expected data, consider refetching pin details or rolling back optimistic update more reliably.");
        // Untuk kasus sederhana, rollback:
        // setIsLiked(originalIsLiked);
        // setLikeCount(originalLikeCount);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setIsLiked(originalIsLiked); // Rollback jika error
      setLikeCount(originalLikeCount);
      // Tambahkan notifikasi error untuk pengguna jika perlu
    }
  };

  // Fallback jika pin atau pin.user tidak ada
  if (!pin) return null;
  const pinUser = pin.user || {};

  return (
    <div className="mb-6 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
      <Link href={`/pins/${pin.id}`} legacyBehavior>
        <a className="relative cursor-zoom-in block">
          <img
            src={pin.image_url?.startsWith('/uploads/') ? `${BASE_URL}${pin.image_url}` : (pin.image_url || '/img/default-pin.png')}
            alt={pin.title || 'Pin image'}
            className="w-full h-auto object-cover aspect-[3/4]" // Contoh aspect ratio
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex flex-col justify-end p-3">
            <h3 className="text-white font-semibold text-md drop-shadow-md line-clamp-2">{pin.title}</h3>
            {/* Deskripsi bisa ditampilkan di sini jika diinginkan, atau hanya pada hover */}
          </div>
        </a>
      </Link>

      <div className="p-3">
        {/* Bagian atas (judul singkat atau tag) bisa dihilangkan jika sudah ada di overlay gambar */}
        {/* <h3 className="font-semibold text-gray-800 truncate mb-1">{pin.title}</h3> */}

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
          <Link href={`/users/${pin.user_id || pinUser.id}`} legacyBehavior>
            <a className="flex items-center space-x-2 group">
              <img
                src={pinUser.avatar_url?.startsWith('/uploads/') ? `${BASE_URL}${pinUser.avatar_url}` : (pinUser.avatar_url || '/img/default-avatar.png')}
                alt={pinUser.username || 'User avatar'}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-medium text-gray-700 group-hover:text-primary">{pinUser.username || 'Anonymous'}</span>
            </a>
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

            <Link href={`/pins/${pin.id}#comments`} legacyBehavior>
              <a className="flex items-center space-x-1 text-gray-500 hover:text-primary">
                <FaComment />
                <span className="text-xs">{pin.comment_count || 0}</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}