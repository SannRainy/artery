// client/src/components/profile/ProfileHeader.jsx
import Image from 'next/image';
import { FiEdit, FiHome } from 'react-icons/fi'; // Pastikan FiHome diimpor
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const ProfileHeader = ({ user, isCurrentUser }) => {
  let avatarSrc = '/img/default-avatar.png'; 

  if (user && user.avatar_url) {
    if (user.avatar_url.startsWith('/uploads/')) { 
      avatarSrc = `${BASE_URL}${user.avatar_url}`;
    } else if (user.avatar_url.startsWith('/img/')) { 
      avatarSrc = user.avatar_url; 
    }
    // Anda bisa menambahkan kondisi lain di sini jika avatar_url bisa berupa URL eksternal penuh
    // else if (user.avatar_url.startsWith('http')) {
    //   avatarSrc = user.avatar_url;
    // }
  }

  return (
    <div className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src={avatarSrc}
              alt={`${user?.username || 'User'}'s profile`}
              layout="fill"
              objectFit="cover"
              key={avatarSrc} 
            />
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
                <span className="font-bold block text-sm sm:text-base">{user?.followersCount || 0}</span>
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
            {/* Tombol Beranda akan selalu ada jika Anda mau, atau kondisional */}
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <FiHome /> Beranda
            </Link>

            {isCurrentUser && (
              <Link 
                href="/settings/profile" 
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <FiEdit /> Edit Profile
              </Link>
            )}
               {!isCurrentUser && user && (
              <button 
                // onClick={handleFollow} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                { isFollowing ? 'Unfollow' : 'Follow' }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;