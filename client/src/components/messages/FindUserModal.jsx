// client/src/components/messages/FindUserModal.jsx
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import debounce from 'lodash.debounce';
import api from '../../services/api'; 
import { followUser } from '../../lib/api/profile'; 
import { initiateConversation } from '../../services/messages'; 
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import LoadingSpinner from '../ui/LoadingSpinner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const UserResultItem = ({ result, onAction }) => {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(result.is_following);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFollow = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await followUser(result.id);
      setIsFollowing(prev => !prev);
    } catch (err) {
      toast.error("Gagal mengikuti pengguna.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChat = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await initiateConversation(result.id);
      onAction(); // Menutup modal
      router.push('/messages');
    } catch (err) {
      toast.error("Tidak dapat memulai percakapan.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center p-3 hover:bg-gray-100 rounded-lg">
      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
        <Image src={result.avatar_url?.startsWith('/uploads/') ? `${BASE_URL}${result.avatar_url}` : (result.avatar_url || '/img/default-avatar.png')} layout="fill" objectFit="cover" alt={result.username} />
      </div>
      <p className="font-semibold flex-grow">{result.username}</p>
      <div className="flex items-center space-x-2">
        {isFollowing && (
          <button onClick={handleChat} disabled={isProcessing} className="text-sm bg-primary text-white font-semibold py-1.5 px-3 rounded-full hover:bg-primary-dark disabled:opacity-50">Chat</button>
        )}
        <button onClick={handleFollow} disabled={isProcessing} className={`text-sm font-semibold py-1.5 px-3 rounded-full disabled:opacity-50 ${isFollowing ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-800 text-white hover:bg-black'}`}>
          {isFollowing ? 'Diikuti' : 'Ikuti'}
        </button>
      </div>
    </div>
  );
};

export default function FindUserModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);


  const searchUsers = useCallback(debounce(async (searchQuery) => {
    setLoading(true);
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response?.status !== 404) {
        toast.error("Gagal mencari pengguna.");
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 300), []);

  useEffect(() => {
    if (isOpen) {
      searchUsers('');
    }
  }, [isOpen, searchUsers]);

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchUsers(newQuery);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">Cari Orang</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><XMarkIcon className="h-5 w-5" /></button>
        </div>
        <div className="p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Cari berdasarkan username..."
              className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-80 min-h-[10rem] overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex justify-center py-4"><LoadingSpinner /></div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map(result => (
                <UserResultItem key={result.id} result={result} onAction={onClose} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4 text-sm">
              {query ? `Tidak ada pengguna ditemukan untuk "${query}"` : "Ketik untuk mencari pengguna."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}