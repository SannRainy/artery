// client/src/components/profile/ProfileHeader.jsx
import Image from 'next/image';
import { FiEdit, FiHome } from 'react-icons/fi';
import Link from 'next/link';
import { useState, useEffect } from 'react'; // <-- 1. Import useState dan useEffect
import { useAuth } from '../../contexts/AuthContexts'; // <-- 2. Import useAuth
import { followUser } from '../../lib/api/profile'; // <-- 3. Asumsi service ini ada
import { toast } from 'react-toastify'; // <-- 4. Untuk notifikasi

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

// Hapus 'isFollowing' dan 'handleFollow' dari props, karena akan kita kelola di sini
const ProfileHeader = ({ user, isCurrentUser }) => {
  const { user: currentUser } = useAuth(); // Ambil data user yang sedang login

  // === PERUBAHAN UTAMA: State Management ===
  const [isFollowing, setIsFollowing] = useState(user?.is_following || false);
  const [followersCount, setFollowersCount] = useState(user?.followersCount || 0);

  // Sinkronkan state jika data user dari props berubah
  useEffect(() => {
    setIsFollowing(user?.is_following || false);
    setFollowersCount(user?.followersCount || 0);
  }, [user]);

  const handleFollow = async () => {
    if (!currentUser) {
      toast.info("Silakan login untuk mengikuti pengguna.");
      return;
    }

    // Optimistic UI Update
    const originalIsFollowing = isFollowing;
    const originalFollowersCount = followersCount;
    setIsFollowing(!originalIsFollowing);
    setFollowersCount(prev => (originalIsFollowing ? prev - 1 : prev + 1));

    try {
      await followUser(user.id);
    } catch (error) {
      console.error("Gagal follow/unfollow:", error);
      toast.error("Terjadi kesalahan.");
      // Rollback jika gagal
      setIsFollowing(originalIsFollowing);
      setFollowersCount(originalFollowersCount);
    }
  };
  // ===================================

  let avatarSrc = '/img/default-avatar.png'; 
  if (user && user.avatar_url) {
    if (user.avatar_url.startsWith('/uploads/')) { 
      avatarSrc = `${BASE_URL}${user.avatar_url}`;
    } else if (user.avatar_url.startsWith('/img/')) { 
      avatarSrc = user.avatar_url; 
    }
  }

  return (
    <div className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image src={avatarSrc} alt={`${user?.username || 'User'}'s profile`} layout="fill" objectFit="cover" key={avatarSrc} />
          </div>
          
          {/* Info Pengguna */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{user?.username || 'User'}</h1>
            {user?.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
            
            <div className="flex justify-center md:justify-start gap-8 sm:gap-12 mt-4">
              <div className="text-center">
                <span className="font-bold block text-sm sm:text-base">{user?.pinsCount || 0}</span>
                <span className="text-gray-600 text-xs sm:text-sm">Pins</span>
              </div>
              <div className="text-center">
                <span className="font-bold block text-sm sm:text-base">{followersCount}</span>
                <span className="text-gray-600 text-xs sm:text-sm">Followers</span>
              </div>
              <div className="text-center">
                <span className="font-bold block text-sm sm:text-base">{user?.followingCount || 0}</span>
                <span className="text-gray-600 text-xs sm:text-sm">Following</span>
              </div>
            </div>
          </div>
          
          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0">
            <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base w-full sm:w-auto justify-center">
              <FiHome /> Beranda
            </Link>

            {isCurrentUser && (
              <Link href="/settings/profile" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm sm:text-base w-full sm:w-auto justify-center">
                <FiEdit /> Edit Profile
              </Link>
            )}
            {!isCurrentUser && user && (
              // === PERBAIKAN STYLING DAN FUNGSI TOMBOL FOLLOW ===
              <button 
                onClick={handleFollow} 
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors w-full sm:w-auto justify-center ${
                  isFollowing 
                    ? 'bg-gray-200 text-black hover:bg-gray-300' 
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {isFollowing ? 'Diikuti' : 'Ikuti'}
              </button>
              // ===============================================
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;