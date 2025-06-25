// client/src/pages/index.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContexts';
import { useRouter } from 'next/router';
import Masonry from 'react-masonry-css';
import PinCard from '../components/pins/PinCard';
import PinCreateModal from '../components/pins/PinCreateModal';
import PinDetailModal from '../components/pins/PinDetailModal';
import { getPins, searchPins, toggleLikePin } from '../services/pins';
import Header from '../components/layout/Header';
import debounce from 'lodash.debounce';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SearchHero from '../components/layout/SearchHero';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPin, setSelectedPin] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const categories = ['Semua', 'Pixel char', 'Illustration', 'Sketsa anime', 'Sketsa', 'Ilustrasi karakter'];

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['pins', activeCategory, searchQuery], 
    async ({ pageParam = 1 }) => {

      const categoryToSend = activeCategory === 'Semua' ? '' : activeCategory;
      const response = searchQuery
        ? await searchPins(searchQuery, pageParam)
        : await getPins({ page: pageParam, category: categoryToSend });
      return response; 
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        const currentPage = lastPage.pagination?.currentPage;
        const totalPages = lastPage.pagination?.totalPages;
        if (currentPage && currentPage < totalPages) {
          return currentPage + 1;
        }
        return undefined; 
      },
    }
  );

  const pins = data?.pages.flatMap(page => page.data) ?? [];

  const { mutate: handleLikeMutation } = useMutation(
    toggleLikePin,
    {
      onMutate: async (pinId) => {
        const queryKey = ['pins', activeCategory, searchQuery];
        await queryClient.cancelQueries(queryKey);
        const previousData = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(p =>
                p.id === pinId
                  ? {
                      ...p,
                      is_liked: !p.is_liked,
                      like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1,
                    }
                  : p
              ),
            })),
          };
        });
        return { previousData };
      },
      onError: (err, pinId, context) => {

        const queryKey = ['pins', activeCategory, searchQuery];
        queryClient.setQueryData(queryKey, context.previousData);
      },
      onSettled: () => {

        const queryKey = ['pins', activeCategory, searchQuery];
        queryClient.invalidateQueries(queryKey);
      },
    }
  );

  const handlePinUpdate = (updatedPinData) => {
    const queryKey = ['pins', activeCategory, searchQuery];
    queryClient.setQueryData(queryKey, (oldData) => {
       if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.map(p =>
              p.id === updatedPinData.id ? { ...p, ...updatedPinData } : p
            ),
          })),
        };
    });
  };

  const observer = useRef();
  const lastPinRef = useCallback(node => {
    if (isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (router.isReady && router.query.pinId) {
      const pinId = parseInt(router.query.pinId, 10);
      if (pins.length > 0) {
        const pinToOpen = pins.find(p => p.id === pinId);
        setSelectedPin(pinToOpen || { id: pinId });
      } else {
        setSelectedPin({ id: pinId });
      }
    } else if (router.isReady && !router.query.pinId) {
      setSelectedPin(null);
    }
  }, [router.isReady, router.query.pinId, pins]);

  const handleCategoryClick = (category) => {
    if (activeCategory !== category) {
      setSearchQuery('');
      setActiveCategory(category);
    }
  };
  
  const debouncedSearch = useCallback(debounce((query) => {
    setActiveCategory('Semua');
    setSearchQuery(query);
  }, 500), []);

  const handleOpenPinDetail = (pin) => {
    setSelectedPin(pin);
    router.push(`/?pinId=${pin.id}`, `/pins/${pin.id}`, { shallow: true });
  };
  
  const handleClosePinDetail = () => {
    setSelectedPin(null);
    router.push('/', undefined, { shallow: true });
  };

  const handlePinCreated = (newPin) => {
    queryClient.invalidateQueries(['pins', activeCategory, searchQuery]);
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
        
        {isLoading ? (
          <div className="text-center py-10"><LoadingSpinner /></div>
        ) : isError ? (
          <div className="text-center py-10 text-red-500">{error.message}</div>
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
                  onLike={() => handleLikeMutation(pin.id)}
                />
              </div>
            ))}
          </Masonry>
        )}

        {isFetchingNextPage && <div className="text-center py-8"><LoadingSpinner /></div>}
        
        {!hasNextPage && pins.length > 0 && (
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