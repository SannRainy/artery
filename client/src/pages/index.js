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
import SearchHero from '../components/layout/SearchHero'; 

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- State untuk Modal ---
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Ambil pinId dari router query saat komponen pertama kali mount
  useEffect(() => {
    if (router.isReady && router.query.pinId) {
      setSelectedPinId(parseInt(router.query.pinId, 10));
    }
  }, [router.isReady, router.query.pinId]);


  const fetchAndSetPins = useCallback(async (pageNum, query, category, isAppending) => {
    if (authLoading || !isAuthenticated) {
      setPins([]); setLoading(false); setHasMore(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const categoryToSend = category === 'Semua' ? '' : category;
      const response = query ? await searchPins(query, pageNum) : await getPins({ page: pageNum, category: categoryToSend });
      const newPins = response?.data || [];
      const pagination = response?.pagination;

      // --- Logika Anti-Duplikat ---
      if (isAppending) {
        setPins(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPins = newPins.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPins];
        });
      } else {
        setPins(newPins);
      }

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
  }, [isAuthenticated, authLoading]);
  
  // --- Trigger pengambilan data ---
  useEffect(() => {
    fetchAndSetPins(page, searchQuery, activeCategory, page > 1);
  }, [page, searchQuery, activeCategory, fetchAndSetPins]);


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
    const searchInput = document.querySelector('input[placeholder="Apa yang sedang Anda cari?"]');
    if (searchInput) searchInput.value = query;
    setActiveCategory('Semua');
    setPage(1);
    setSearchQuery(query);
  };

  const handleResetSearch = () => {
    const searchInput = document.querySelector('input[placeholder="Apa yang sedang Anda cari?"]');
    if (searchInput) searchInput.value = '';
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


  const handleOpenPinDetail = (pinId) => {
    setSelectedPinId(pinId);
    router.push(`/?pinId=${pinId}`, `/pins/${pinId}`, { shallow: true });
  };
  
  const handleClosePinDetail = () => {
    setSelectedPinId(null);
    router.push('/', undefined, { shallow: true });
  };

  const handlePinCreated = (newPin) => {
    setPins(prev => {
        const pinExists = prev.some(p => p.id === newPin.id);
        if (!pinExists) {
            return [newPin, ...prev];
        }
        return prev;
    });
    setActiveCategory('Semua');
    setSearchQuery('');
    setPage(1);
  };
  
  const breakpointColumnsObj = { default: 5, 1280: 4, 1024: 3, 768: 2, 640: 2 };

  if (authLoading && !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />

      <main className="container mx-auto px-4 pt-24 pb-8">
        <SearchHero 
          onSearch={debouncedSearch}
          onSuggestionClick={handleSuggestionClick}
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
              <div key={pin.id} onClick={() => handleOpenPinDetail(pin.id)}>
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
        
        {!hasMore && pins.length > 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            <p>Anda telah melihat semua pin.</p>
          </div>
        )}
      </main>

      {selectedPinId && (
        <PinDetailModal 
          pinId={selectedPinId}
          isOpen={!!selectedPinId} 
          onClose={handleClosePinDetail} 
        />
      )}
      <PinCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onPinCreated={handlePinCreated} />
    </div>
  );
}