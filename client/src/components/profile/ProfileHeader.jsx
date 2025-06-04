// client/src/components/profile/ProfileHeader.jsx
import Image from 'next/image';
import { FiEdit } from 'react-icons/fi';
import Link from 'next/link';

// BASE_URL harus konsisten dengan setup Anda untuk gambar yang disajikan backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const ProfileHeader = ({ user, isCurrentUser }) => {
  let avatarSrc = '/img/default-avatar.png'; // Fallback ke gambar lokal di client/public/img/

  if (user && user.avatar_url) {
    if (user.avatar_url.startsWith('/uploads/')) { // Untuk avatar yang diupload (disajikan oleh backend)
      avatarSrc = `${BASE_URL}${user.avatar_url}`;
    } else if (user.avatar_url.startsWith('/img/')) { // Untuk default avatar lokal baru dari DB
      avatarSrc = user.avatar_url; // Ini sudah path relatif ke folder public Next.js
    }

  }

  return (
    <div className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src={avatarSrc}
              alt={`${user?.username || 'User'}'s profile`}
              layout="fill"
              objectFit="cover"
              key={avatarSrc} // Penting jika src bisa berubah, untuk memaksa re-render Image
            />
          </div>
          {/* ...sisa JSX... */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{user?.username || 'User'}</h1>
            {user?.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
            
            <div className="flex justify-center md:justify-start gap-12 mt-4">
              <div className="text-center">
                <span className="font-bold block">{user?.pinsCount || 0}</span>
                <span className="text-gray-600 text-sm">Pins</span>
              </div>
              <div className="text-center">
                <span className="font-bold block">{user?.followersCount || 0}</span>
                <span className="text-gray-600 text-sm">Followers</span>
              </div>
              <div className="text-center">
                <span className="font-bold block">{user?.followingCount || 0}</span>
                <span className="text-gray-600 text-sm">Following</span>
              </div>
            </div>
          </div>
          
          {isCurrentUser && (
            <Link href="/settings/profile" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
              <FiEdit /> Edit Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;