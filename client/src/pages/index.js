import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContexts';
import { useRouter } from 'next/router';
import MasonryLayout from '../components/layout/MasonryLayout';
import PinCard from '../components/pins/PinCard';
import PinCreateModal from '../components/pins/PinCreateModal';
import { getPins, searchPins } from '../services/pins';
import Header from '../components/layout/Header';
import debounce from 'lodash.debounce';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to login if user not authenticated
  useEffect(() => {
    if (user === null) {
      router.replace('/login');
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
  const observer = useRef();

  const categories = [
    'Semua',
    'Pixel char',
    'Illustration',
    'Sketsa anime',
    'Sketsa',
    'Ilustrasi karakter',
  ];

  // Fetch pins from backend depending on page, search query, and category
  const fetchPins = useCallback(async (pageNum = 1, query = '', category = 'Semua') => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (query) {
        data = await searchPins(query, pageNum);
      } else if (category !== 'Semua') {
        data = await getPins(pageNum, category);
      } else {
        data = await getPins(pageNum);
      }

      const processedData = Array.isArray(data) ? data : [];

      if (pageNum === 1) {
        setPins(processedData);
      } else {
        setPins(prevPins => [...prevPins, ...processedData]);
      }

      setHasMore(processedData.length > 0);
    } catch (err) {
      console.error('Error fetching pins:', err);
      setError('Gagal memuat pin. Silakan coba lagi nanti.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // IntersectionObserver untuk infinite scroll
  const lastPinRef = useCallback(
    node => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prevPage => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Debounce untuk pencarian
  const debouncedSearch = debounce(query => {
    setSearchQuery(query);
    setPage(1);
  }, 500);

  // Reset semua filter pencarian dan kategori
  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('Semua');
    setPage(1);
  };

  // Fetch pins ketika page, searchQuery, activeCategory, atau user berubah
  useEffect(() => {
    if (user) {
      fetchPins(page, searchQuery, activeCategory);
    }
  }, [page, searchQuery, activeCategory, fetchPins, user]);

  // Tambahkan pin baru ke list ketika dibuat
  const handlePinCreated = newPin => {
    setPins(prevPins => [newPin, ...prevPins]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={debouncedSearch}
        searchQuery={searchQuery}
        onResetSearch={resetFilters}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <main className="container mx-auto px-4 pt-28 md:pt-24 pb-8">
        {/* Kategori */}
        <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <div className="flex space-x-2">
            {categories.map(category => (
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

        {/* Kondisi loading, error, tidak ada pin, dan grid pin */}
        {loading && page === 1 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : pins.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Tidak ada pin ditemukan. Buat satu!</p>
          </div>
        ) : (
          <>
            <MasonryLayout>
              {Array.isArray(pins) &&
                pins.map((pin, index) => (
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

      <PinCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPinCreated={handlePinCreated}
      />
    </div>
  );
}
