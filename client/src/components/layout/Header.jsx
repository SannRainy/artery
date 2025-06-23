// client/src/components/layout/Header.jsx
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContexts';
import { FiPlus, FiBell, FiMessageSquare, FiChevronDown, FiLogOut, FiUser } from 'react-icons/fi';
import { getImageUrl } from '../../utils/helpers';

export default function Header({ onCreateClick }) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const defaultAvatarUrl = 'https://weuskrczzjbswnpsgbmp.supabase.co/storage/v1/object/public/uploads/default-avatar.png';
  const avatarSrc = getImageUrl(user?.avatar_url || defaultAvatarUrl);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="ml-2 font-bold text-xl hidden sm:inline">Artery Project</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <>
                <Link href="/notifications" className="p-2 rounded-full hover:bg-gray-100 hidden sm:block" title="Notifikasi">
                  <FiBell className="text-gray-700 text-xl" />
                </Link>
                <Link href="/messages" className="p-2 rounded-full hover:bg-gray-100 hidden sm:block" title="Pesan">
                  <FiMessageSquare className="text-gray-700 text-xl" />
                </Link>
                <button
                  onClick={onCreateClick}
                  className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark"
                  title="Buat Pin Baru"
                >
                  <FiPlus className="text-xl" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center p-1 rounded-full hover:bg-gray-100"
                    aria-expanded={isProfileOpen} aria-haspopup="true" aria-controls="profile-menu"
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                      {/* Pastikan `key` unik untuk memaksa re-render jika avatar berubah */}
                      <Image src={avatarSrc} alt={user.username || 'User Avatar'} layout="fill" objectFit="cover" key={avatarSrc} />
                    </div>
                    <FiChevronDown className="ml-1 text-gray-600 h-4 w-4" />
                  </button>
                  {isProfileOpen && (
                    <div id="profile-menu" className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200" role="menu">
                      <span className="block px-4 py-2 text-xs text-gray-500 border-b mb-1">
                        Login sebagai <strong className="block text-sm text-gray-700">{user.username}</strong>
                      </span>
                      <Link href={`/users/${user.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" onClick={() => setIsProfileOpen(false)} role="menuitem">
                        <FiUser className="inline mr-2 h-4 w-4" /> Profil Saya
                      </Link>
                      <button onClick={() => { logout(); setIsProfileOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left" role="menuitem">
                        <FiLogOut className="mr-2 h-4 w-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {!user && (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary">
                  Login
                </Link>
                <Link href="/register" className="px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}