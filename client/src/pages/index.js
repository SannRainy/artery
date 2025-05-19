import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContexts';
import { useRouter } from 'next/router';
import MasonryLayout from '../components/layout/MasonryLayout';
import PinCard from '../components/pins/PinCard';
import PinCreateModal from '../components/pins/PinCreateModal';
import { getPins, searchPins } from '../services/pins';
import Button from '../components/ui/Button';
import { FiPlus, FiSearch, FiBell, FiMessageSquare, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { FaPinterest } from 'react-icons/fa';
import debounce from 'lodash.debounce';

export default function Home() {

  const { user, logout } = useAuth();
  const router = useRouter(); // Inisialisasi router

  // Redirect ke login jika user tidak ada (belum login)
  useEffect(() => {
    if (user === null) {  // user null artinya belum login
      router.replace('/login');  // redirect ke halaman login
    }
  }, [user, router]);

  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const observer = useRef();

  const categories = [
    'Semua',
    'Pixel char',
    'Illustration',
    'Sketsa anime',
    'Sketsa',
    'Ilustrasi karakter'
  ];

  // Fetch pins with pagination and filtering
  const fetchPins = useCallback(async (pageNum = 1, query = '', category = 'Semua') => {
    try {
      setLoading(true);
      let data;
      if (query) {
        data = await searchPins(query, pageNum);
      } else if (category !== 'Semua') {
        // Implement category filtering in your backend or client-side
        data = await getPins(pageNum, category);
      } else {
        data = await getPins(pageNum);
      }

      if (pageNum === 1) {
        setPins(data);
      } else {
        setPins(prevPins => [...prevPins, ...data]);
      }
      setHasMore(data.length > 0);
    } catch (err) {
      console.error(err);
      setError('Failed to load pins. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Infinite scroll observer
  const lastPinRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Debounced search
  const debouncedSearch = debounce(query => {
    setSearchQuery(query);
    setPage(1);
  }, 500);

  // Reset search and category
  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('Semua');
    setPage(1);
  };

  // Load pins on page, search, or category change
  useEffect(() => {
    if (user) {
      fetchPins(page, searchQuery, activeCategory);
    }
  }, [page, searchQuery, activeCategory, fetchPins, user]);

  const handlePinCreated = (newPin) => {
    setPins(prevPins => [newPin, ...prevPins]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <FaPinterest className="text-red-500 text-3xl" />
              <span className="ml-2 font-bold text-xl hidden sm:inline">Artery Project</span>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 mx-4 max-w-xl">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Type here to search"
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={resetFilters}
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
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <FiPlus className="text-xl" />
                </button>
              )}
              {user?.avatar && (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center"
                  >
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <FiChevronDown className="ml-1 text-gray-600" />
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={logout}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FiLogOut className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search - Visible only on mobile */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-28 md:pt-24 pb-8">
        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-black text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Pins Grid */}
        {loading && page === 1 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : pins.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No pins found. Create one!</p>
            {user && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 flex items-center gap-2 bg-primary hover:bg-primary-dark text-white mx-auto"
              >
                <FiPlus /> Create Pin
              </Button>
            )}
          </div>
        ) : (
          <>
            <MasonryLayout>
              {pins.map((pin, index) => (
                <div 
                  key={pin.id} 
                  ref={index === pins.length - 1 ? lastPinRef : null}
                >
                  <PinCard pin={pin} />
                </div>
              ))}
            </MasonryLayout>
            {loading && page > 1 && (
              <div className="flex justify-center my-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Pin Modal */}
      <PinCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPinCreated={handlePinCreated}
      />
    </div>
  );
}