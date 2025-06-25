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
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = ['Semua', 'Pixel char', 'Illustration', 'Sketsa anime', 'Sketsa', 'Ilustrasi karakter'];

  const [selectedPin, setSelectedPin] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (router.isReady && router.query.pinId) {
      const pinId = parseInt(router.query.pinId, 10);
      const pinToOpen = pins.find(p => p.id === pinId) || { id: pinId };
      setSelectedPin(pinToOpen);
    } else if (router.isReady && !router.query.pinId) {
      setSelectedPin(null);
    }
  }, [router.isReady, router.query.pinId, pins]);

  const handlePinUpdate = (updatedPinData) => {
    setPins(currentPins =>
      currentPins.map(p =>
        p.id === updatedPinData.id ? { ...p, ...updatedPinData } : p
      )
    );

    if (selectedPin && selectedPin.id === updatedPinData.id) {
      setSelectedPin(prev => ({ ...prev, ...updatedPinData }));
    }
  };

  const fetchAndSetPins = useCallback(async (pageNum, query, category) => {
    setLoading(true);
    setError(null);

    const isAppending = pageNum > 1 && !query && category === activeCategory;

    try {
      const categoryToSend = category === 'Semua' ? '' : category;
      const response = query
        ? await searchPins(query, pageNum)
        : await getPins({ page: pageNum, category: categoryToSend });

      const newPins = response?.data || [];
      const pagination = response?.pagination;

      if (isAppending) {
        setPins(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPins = newPins.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPins];
        });
      } else {
        setPins(newPins);
      }

      setHasMore(pagination ? pageNum < pagination.totalPages : newPins.length > 0);
    } catch (err) {
      console.error('Failed to fetch pins:', err);
      setError('Gagal memuat pin.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchAndSetPins(page, searchQuery, activeCategory);
  }, [page, searchQuery, activeCategory, fetchAndSetPins]);

  const handleCategoryClick = (category) => {
    if (activeCategory !== category) {
      setSearchQuery('');
      setPins([]);
      setPage(1);
      setHasMore(true);
      setActiveCategory(category);
    }
  };
  
  const debouncedSearch = useCallback(debounce((query) => {
    setActiveCategory('Semua');
    setPins([]);
    setPage(1);
    setHasMore(true);
    setSearchQuery(query);
  }, 500), []);

  const observer = useRef();
  const lastPinRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !searchQuery) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, searchQuery]);

  const handleOpenPinDetail = (pin) => {
    setSelectedPin(pin);
    router.push(`/?pinId=${pin.id}`, `/pins/${pin.id}`, { shallow: true });
  };
  
  const handleClosePinDetail = () => {
    setSelectedPin(null);
    router.push('/', undefined, { shallow: true });
  };

  const handlePinCreated = (newPin) => {
    setPins(prev => [newPin, ...prev]);
  };

  const breakpointColumnsObj = { default: 5, 1280: 4, 1024: 3, 768: 2, 640: 2 };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCreateClick={() => user ? setIsCreateModalOpen(true) : router.push('/login')} />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <SearchHero onSearch={debouncedSearch} onSuggestionClick={handleCategoryClick} />
        
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
              <div key={pin.id} onClick={() => handleOpenPinDetail(pin)}>
                <PinCard 
                  pin={pin} 
                  index={index} 
                  ref={index === pins.length - 1 ? lastPinRef : null} 
                  onPinUpdate={handlePinUpdate}
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

      {selectedPin && (
        <PinDetailModal 
          pin={selectedPin}
          isOpen={!!selectedPin} 
          onClose={handleClosePinDetail}
          onPinUpdate={handlePinUpdate} 
        />
      )}
      <PinCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onPinCreated={handlePinCreated} />
    </div>
  );
}