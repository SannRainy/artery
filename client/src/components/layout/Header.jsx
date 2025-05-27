import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContexts';
import { FiSearch, FiPlus, FiBell, FiMessageSquare, FiChevronDown, FiLogOut, FiUser } from 'react-icons/fi';

export default function Header({ onSearch, searchQuery, onResetSearch, onCreateClick }) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo - Replaced Pinterest with Artery Project logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="ml-2 font-bold text-xl hidden sm:inline">Artery Project</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 mx-4 max-w-xl">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Type here to search"
                onChange={(e) => onSearch(e.target.value)}
                value={searchQuery}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={onResetSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 hidden sm:block">
              <FiBell className="text-gray-700 text-xl" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 hidden sm:block">
              <FiMessageSquare className="text-gray-700 text-xl" />
            </button>

            {user && (
              <>
                <button
                  onClick={onCreateClick}
                  className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark"
                >
                  <FiPlus className="text-xl" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center"
                  >
                    {/* Avatar placeholder */}
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="text-gray-600" />
                    </div>
                    <FiChevronDown className="ml-1 text-gray-600" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href={`/users/${user.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        <FiLogOut className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              onChange={(e) => onSearch(e.target.value)}
              value={searchQuery}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
            />
          </div>
        </div>
      </div>
    </header>
  );
}