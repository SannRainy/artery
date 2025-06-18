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
import { likePin as toggleLikeService } from '../services/pins'; // Import service untuk like/unlike
import debounce from 'lodash.debounce';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [selectedPin, setSelectedPin] = useState(null);
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
  
  const fetchAndSetPins = useCallback(async (pageNum, query, category, isAppending) => {
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

      setPins(prev => isAppending ? [...prev, ...newPins] : newPins);
      
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
  
  // useEffect utama untuk semua pengambilan data
  useEffect(() => {
    fetchAndSetPins(page, searchQuery, activeCategory, page > 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, activeCategory, isAuthenticated]);

  const handleCategoryClick = (category) => {
    if (activeCategory !== category) {
      setSearchQuery('');
      setPage(1);
      setActiveCategory(category);
    }
  };
  
  const debouncedSearch = useCallback(debounce(query => {
    setActiveCategory('Semua');
    setPage(1);
    setSearchQuery(query);
  }, 500), []);
  
  // === PERUBAHAN UTAMA DI SINI ===
  const observer = useRef();
  const lastPinRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(async entries => {
      if (entries[0].isIntersecting) {
        if (hasMore) {
          // Jika masih ada halaman, muat halaman berikutnya
          setPage(prevPage => prevPage + 1);
        } else if (!hasMore && activeCategory === 'Semua' && !searchQuery) {
          // Jika sudah habis, TAPI kategori adalah "Semua" dan tidak sedang mencari,
          // aktifkan UNLIMITED SCROLL dengan mode random.
          setLoading(true);
          const response = await getPins({ page: 1, mode: 'random' });
          setPins(prev => [...prev, ...(response?.data || [])]);
          setLoading(false);
        }
        // Jika sudah habis dan berada di kategori lain, tidak melakukan apa-apa.
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, activeCategory, searchQuery]); // Tambahkan dependensi
  // === AKHIR PERUBAHAN ===
  
  const handleOpenPinDetail = (pin) => router.push(`/?pinId=${pin.id}`, `/pins/${pin.id}`, { shallow: true });
  const handleClosePinDetail = () => router.push('/', undefined, { shallow: true });
  useEffect(() => {
    if (router.isReady) {
      const { pinId } = router.query;
      if (pinId && pins.length > 0) {
        const pinToOpen = pins.find(p => p.id === parseInt(pinId, 10));
        if (pinToOpen) setSelectedPin(pinToOpen);
      } else if (!pinId) {
        setSelectedPin(null);
      }
    }
  }, [router.isReady, router.query.pinId, pins]);
  
  const handlePinCreated = (newPin) => setPins(prev => [newPin, ...prev]);

  const handlePinLikeToggle = useCallback(async (pinToUpdate) => {
    if (!pinToUpdate) return;

    const originalPinInArray = pins.find(p => p.id === pinToUpdate.id);
    const originalIsLiked = originalPinInArray?.is_liked;
    const originalLikeCount = originalPinInArray?.like_count;

    // Optimistic update
    const optimisticUpdate = (prevItems) =>
      prevItems.map(p =>
        p.id === pinToUpdate.id
          ? { ...p, is_liked: !p.is_liked, like_count: p.is_liked ? (p.like_count || 0) - 1 : (p.like_count || 0) + 1 }
          : p
      );

    setPins(optimisticUpdate);
    if (selectedPin && selectedPin.id === pinToUpdate.id) {
      setSelectedPin(prev => ({ ...prev, is_liked: !prev.is_liked, like_count: prev.is_liked ? (prev.like_count || 0) - 1 : (prev.like_count || 0) + 1 }));
    }

    try {
      const response = await toggleLikeService(pinToUpdate.id); // API call
      // Update with server response
      const serverUpdate = (prevItems) =>
        prevItems.map(p =>
          p.id === pinToUpdate.id
            ? { ...p, is_liked: response.liked, like_count: response.new_like_count }
            : p
        );
      setPins(serverUpdate);
      if (selectedPin && selectedPin.id === pinToUpdate.id) {
        setSelectedPin(prev => ({ ...prev, is_liked: response.liked, like_count: response.new_like_count }));
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert optimistic update on error
      const revertUpdate = (prevItems) => prevItems.map(p => p.id === pinToUpdate.id ? { ...p, is_liked: originalIsLiked, like_count: originalLikeCount } : p);
      setPins(revertUpdate);
      if (selectedPin && selectedPin.id === pinToUpdate.id) {
        setSelectedPin(prev => ({ ...prev, is_liked: originalIsLiked, like_count: originalLikeCount }));
      }
    }
  }, [pins, selectedPin, setPins, setSelectedPin]);

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
                <PinCard 
                  pin={pin} 
                  index={index} 
                  ref={index === pins.length - 1 ? lastPinRef : null} 
                  onLikeToggle={() => handlePinLikeToggle(pin)} // Teruskan callback ke PinCard
                />
              </div>
            ))}
          </Masonry>
        )}

        {loading && pins.length > 0 && <div className="text-center py-8"><LoadingSpinner /></div>}
        
        {/* Pesan untuk menandakan akhir konten di kategori spesifik */}
        {!hasMore && activeCategory !== 'Semua' && pins.length > 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            <p>Anda telah melihat semua pin di kategori ini.</p>
          </div>
        )}
      </main>

      {selectedPin && (
        <PinDetailModal 
          pin={selectedPin} 
          isOpen={!!selectedPin} 
          onClose={handleClosePinDetail} 
          onLikeToggle={() => handlePinLikeToggle(selectedPin)} // Teruskan callback ke PinDetailModal
        />
      )}
      <PinCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onPinCreated={handlePinCreated} />
    </div>
  );
}