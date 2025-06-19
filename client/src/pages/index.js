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
import { likePin as toggleLikeService } from '../services/pins';
import debounce from 'lodash.debounce';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SearchHero from '../components/layout/SearchHero'; 

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

    if (authLoading) return; 
    if (!isAuthenticated) {
        setPins([]);
        setLoading(false);
        setHasMore(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const categoryToSend = category === 'Semua' ? '' : category;
      const isGeneralBrowsing = !query && !categoryToSend;
      
      let response;
      if (query) {
        response = await searchPins(query, pageNum);
      } else {
        response = await getPins({ 
            page: pageNum, 
            category: categoryToSend, 
            mode: isGeneralBrowsing ? 'random' : '' 
        });
      }

      const newPins = response?.data || [];
      const pagination = response?.pagination;

      setPins(prev => (pageNum > 1 && isAppending) ? [...prev, ...newPins] : newPins);
      
      if (isGeneralBrowsing) {

        setHasMore(newPins.length > 0); 
      } else if (pagination) {
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
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchAndSetPins(page, searchQuery, activeCategory, page > 1);
    } else if (!authLoading && !isAuthenticated) {

      setPins([]);
      setLoading(false);
      setHasMore(false);
    }
  }, [page, searchQuery, activeCategory, isAuthenticated, authLoading, fetchAndSetPins]);

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
  
  const handleSuggestionClick = (query) => {
    debouncedSearch.cancel();
    setActiveCategory('Semua');
    setPage(1);
    setSearchQuery(query);
  };


  const handleResetSearch = () => {
    setSearchQuery('');

  };
  
  const observer = useRef();
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
  }, [router.isReady, router.query, pins]);

  const handlePinCreated = (newPin) => setPins(prev => [newPin, ...prev]);
  const handlePinLikeToggle = useCallback(async (pinToUpdate) => [pins, selectedPin]);

  const breakpointColumnsObj = { default: 5, 1280: 4, 1024: 3, 768: 2, 640: 2 };

  if (authLoading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <Header onCreateClick={() => setIsCreateModalOpen(true)} />

      <main className="container mx-auto px-4 pt-24 pb-8">

        <SearchHero 
          onSearch={debouncedSearch}
          searchQuery={searchQuery}
          onResetSearch={handleResetSearch}
          onCategorySelect={handleCategoryClick}
          onSuggestionClick={handleSuggestionClick} // <-- TAMBAHKAN PROP INI
        />
        
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
                />
              </div>
            ))}
          </Masonry>
        )}

        {loading && pins.length > 0 && <div className="text-center py-8"><LoadingSpinner /></div>}
        
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
          onLikeToggle={() => handlePinLikeToggle(selectedPin)}
        />
      )}
      <PinCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onPinCreated={handlePinCreated} />
    </div>
  );
}