// client/src/pages/index.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContexts';
import { useRouter } from 'next/router';
import Masonry from 'react-masonry-css'; // Langsung gunakan library
import PinCard from '../components/pins/PinCard';
import PinCreateModal from '../components/pins/PinCreateModal';
import { getPins, searchPins } from '../services/pins';
import Header from '../components/layout/Header';
import debounce from 'lodash.debounce';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // State baru untuk unlimited scroll
  const [allPinsLoaded, setAllPinsLoaded] = useState(false);

  const categories = ['Semua', 'Pixel art', '3D Renders', 'Anime', 'Illustration', 'Sketches'];
  
  // --- Fungsi Fetching yang Diperbaiki ---
  const fetchPins = useCallback(async (pageNum, currentQuery, currentCategory, mode = 'sequential') => {
    // Jangan fetch jika masih loading auth dan belum ada user
    if (authLoading) return;
    if (!user) {
        setLoading(false);
        setPins([]);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      // Panggil API
      const response = currentQuery
        ? await searchPins({ query: currentQuery, page: pageNum })
        : await getPins({ page: pageNum, category: currentCategory, mode });

      // Cek struktur respons dengan hati-hati
      const newPins = response?.data || [];
      const pagination = response?.pagination;
      
      if (!Array.isArray(newPins)) {
          throw new Error("Format data tidak valid diterima dari server.");
      }
      
      if (mode === 'sequential') {
        // Jika halaman pertama, ganti semua pins. Jika tidak, tambahkan.
        setPins(prev => pageNum === 1 ? newPins : [...prev, ...newPins]);
        
        // Cek apakah masih ada data lagi
        if (pagination) {
          const allLoaded = pageNum >= pagination.totalPages;
          setAllPinsLoaded(allLoaded);
          // Tetap set hasMore ke true jika sudah semua, agar bisa beralih ke mode random
          setHasMore(true); 
        } else {
          // Fallback jika tidak ada info pagination
          if (newPins.length === 0) {
            setAllPinsLoaded(true);
            setHasMore(true);
          } else {
            setHasMore(true);
          }
        }
      } else { // mode === 'random'
        setPins(prev => [...prev, ...newPins]);
        setHasMore(true); // Mode random selalu punya "lebih banyak"
      }

    } catch (err) {
      console.error('Failed to fetch pins:', err);
      setError('Gagal memuat pin. Coba lagi nanti.');
      setHasMore(false); // Berhenti mencoba fetch jika ada error
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);


  // --- Logika untuk Infinite Scroll ---
  const observer = useRef();
  const lastPinRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        if (!allPinsLoaded) {
          // Mode sekuensial: muat halaman berikutnya
          setPage(prevPage => prevPage + 1);
        } else {
          // Mode acak: muat pin random
          fetchPins(1, searchQuery, activeCategory, 'random');
        }
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, allPinsLoaded, fetchPins, searchQuery, activeCategory]);

  
  // --- Effects ---
  const debouncedSearch = useCallback(debounce(query => {
    setSearchQuery(query);
    setActiveCategory('Semua');
    setPage(1);
    setAllPinsLoaded(false);
  }, 500), []);
  
  useEffect(() => {
    if (!authLoading && user) {
        // Fetch saat filter atau halaman berubah
        if(page === 1) { // Jika ini adalah fetch awal (halaman 1)
            setPins([]); // Kosongkan dulu untuk menunjukkan state loading dengan benar
        }
        fetchPins(page, searchQuery, activeCategory, 'sequential');
    }
  }, [page, searchQuery, activeCategory, user, authLoading]); // fetchPins tidak perlu di dependensi
  
  const handleCategoryClick = (category) => {
    setSearchQuery('');
    setActiveCategory(category);
    setPage(1);
    setAllPinsLoaded(false);
  };

  const handlePinCreated = (newPin) => {
    setPins(prev => [newPin, ...prev]);
  };

  const breakpointColumnsObj = {
    default: 5,
    1280: 4,
    1024: 3,
    768: 2,
    640: 2
  };
  
  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  if (!user) {
    // Tampilan ini hanya akan terlihat sesaat sebelum redirect
    return <div className="flex justify-center items-center h-screen"><p>Redirecting to login...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={debouncedSearch}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
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
        
        {loading && pins.length === 0 ? (
          <div className="text-center py-10"><LoadingSpinner /></div>
        ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
        ) : pins.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Tidak ada pin untuk ditampilkan.</div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {pins.map((pin, index) => (
              <div key={`${pin.id}-${index}`}>
                <PinCard
                  pin={pin}
                  index={index}
                  ref={index === pins.length - 1 ? lastPinRef : null}
                />
              </div>
            ))}
          </Masonry>
        )}

        {loading && pins.length > 0 && (
          <div className="text-center py-8">
            <LoadingSpinner />
          </div>
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