// client/src/components/layout/SearchHero.jsx
import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { getRandomPinTitles } from '../../services/pins';
import { toast } from 'react-toastify';

export default function SearchHero({ onSearch, onSuggestionClick, searchQuery, onResetSearch }) {
  const [randomTitles, setRandomTitles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomTitles = async () => {
      try {
        setLoading(true);
        const titles = await getRandomPinTitles();
        setRandomTitles(titles); 
      } catch (err) {
        toast.error('Gagal memuat rekomendasi.');
        console.error('Error fetching random titles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRandomTitles();
  }, []); 

  return (
    <div 
      className="relative w-full h-64 md:h-80 bg-cover bg-center rounded-2xl mb-8 flex flex-col items-center justify-center p-4 text-center text-white overflow-hidden"
      style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/img/default-bg.jpg')" }}
    >
      <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
        No Art No Game No Life
      </h1>
      <div className="w-full max-w-xl">

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Apa yang sedang Anda cari?" 
            onChange={(e) => onSearch(e.target.value)} 
            value={searchQuery}
            className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-md"
          />
          {searchQuery && (
            <button 
              onClick={onResetSearch} 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 text-2xl" 
              aria-label="Reset search"
            >
              &times;
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-semibold mr-2">Coba:</span>
          {!loading && randomTitles.map(pin => (
            <button 
              key={pin.id}

              onClick={() => onSuggestionClick(pin.title)}
              className="px-3 py-1.5 text-xs font-semibold bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full transition-colors"
            >
              {pin.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}