// client/src/pages/index.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContexts';
import { useRouter } from 'next/router';
import Masonry from 'react-masonry-css';
import PinCard from '../components/pins/PinCard';
import PinCreateModal from '../components/pins/PinCreateModal';
import PinDetailModal from '../components/pins/PinDetailModal';
import { getPins, searchPins } from '../services/pins';
import Header from '../components/layout/Header';
import debounce from 'lodash.debounce';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [selectedPin, setSelectedPin] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const categories = ['Semua', 'Pixel char', 'Illustration', 'Sketsa anime', 'Sketsa', 'Ilustrasi karakter'];
  
  const fetchAndSetPins = useCallback(async (pageNum, query, category, shouldAppend) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const categoryToSend = category === 'Semua' ? '' : category;
      const response = query
        ? await searchPins({ query: query, page: pageNum })
        : await getPins({ page: pageNum, category: categoryToSend });

      const newPins = response?.data || [];
      const pagination = response?.pagination;

      setPins(prev => shouldAppend ? [...prev, ...newPins] : newPins);
      
      if (pagination) {
        setHasMore(pageNum < pagination.totalPages);
      } else {
        setHasMore(newPins.length > 0);
      }
    } catch (err) {
      console.error('Failed to fetch pins:', err);
      setError('Gagal memuat pin.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Logika untuk Modal Detail Pin
  const handleOpenPinDetail = (pin) => router.push(`/?pinId=${pin.id}`, `/pins/${pin.id}`, { shallow: true });
  const handleClosePinDetail = () => router.push('/', undefined, { shallow: true });
  useEffect(() => {
    if (router.isReady && router.query.pinId && pins.length > 0) {
      const pinToOpen = pins.find(p => p.id === parseInt(router.query.pinId, 10));
      if (pinToOpen) {
        setSelectedPin(pinToOpen);
        setIsDetailModalOpen(true);
      } else {
        handleClosePinDetail();
      }
    } else if (router.isReady && !router.query.pinId) {
      setSelectedPin(null);
      setIsDetailModalOpen(false);
    }
  }, [router.isReady, router.query.pinId, pins]);

  // === PERUBAHAN UTAMA DI SINI ===

  // 1. Logika Infinite Scroll yang sudah diperbaiki
  const observer = useRef();
  const lastPinRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(async entries => {
      if (entries[0].isIntersecting) {
        if (hasMore) {
          // Selalu fetch halaman berikutnya jika hasMore
          setPage(prevPage => prevPage + 1);
        } else if (!hasMore && activeCategory === 'Semua' && !searchQuery) {
          // UNLIMITED SCROLL: hanya jika sudah habis DAN di kategori "Semua"
          setLoading(true);
          const response = await getPins({ page: 1, mode: 'random' });
          const randomPins = response?.data || [];
          setPins(prev => [...prev, ...randomPins]);
          setLoading(false);
        }
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, activeCategory, searchQuery]);

  // 2. useEffect untuk memicu pengambilan data
  useEffect(() => {
    // Hanya fetch jika isAuthenticated, untuk mencegah panggilan saat redirect
    if (isAuthenticated) {
      // Jika halaman 1, ganti data (isAppending=false). Jika > 1, tambahkan data (isAppending=true)
      fetchAndSetPins(page, searchQuery, activeCategory, page > 1);
    }
  }, [page, searchQuery, activeCategory, isAuthenticated, fetchAndSetPins]);

  // 3. Handler untuk filter yang hanya mengatur state
  const handleCategoryClick = (category) => {
    if (activeCategory !== category) {
      setSearchQuery('');
      setPins([]); // Kosongkan pin untuk menampilkan loading
      setPage(1); // Reset halaman ke 1, ini akan memicu useEffect di atas
      setActiveCategory(category);
    }
  };
  
  const debouncedSearch = useCallback(debounce(query => {
    setActiveCategory('Semua');
    setPins([]);
    setPage(1);
    setSearchQuery(query);
  }, 500), []);
  // === AKHIR PERUBAHAN ===

  const handlePinCreated = (newPin) => setPins(prev => [newPin, ...prev]);
  const breakpointColumnsObj = { default: 5, 1280: 4, 1024: 3, 768: 2, 640: 2 };

  if (authLoading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={debouncedSearch} onCreateClick={() => setIsCreateModalOpen(true)} />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-2">
            {categories.map(category => (
              <button key={category} onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  activeCategory === category ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >{category}</button>
            ))}
          </div>
        </div>
        
        {(loading && pins.length === 0) ? (
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
              <div key={`${pin.id}-${index}`} onClick={() => handleOpenPinDetail(pin)}>
                <PinCard pin={pin} index={index} ref={index === pins.length - 1 ? lastPinRef : null} />
              </div>
            ))}
          </Masonry>
        )}

        {loading && pins.length > 0 && <div className="text-center py-8"><LoadingSpinner /></div>}
      </main>

      {isDetailModalOpen && selectedPin && (
        <PinDetailModal pin={selectedPin} isOpen={isDetailModalOpen} onClose={handleClosePinDetail} />
      )}
      <PinCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onPinCreated={handlePinCreated} />
    </div>
  );
}