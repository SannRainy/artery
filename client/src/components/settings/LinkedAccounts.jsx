// client/src/components/settings/LinkedAccounts.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Button from '../ui/Button';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function LinkedAccounts({ currentUser }) {
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      try {
        const { data } = await api.get('/linked-accounts');
        setLinkedAccounts(data);
      } catch (error) {
        toast.error('Failed to load linked accounts.');
      } finally {
        setLoading(false);
      }
    };
    fetchLinkedAccounts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/users/search?q=${searchQuery}`);
        setSearchResults(data);
      } catch (error) {
        console.error('Failed to search users');
      }
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddAccount = async (userToAdd) => {
    try {
      const { data } = await api.post('/linked-accounts', { linkedUserId: userToAdd.id });
      setLinkedAccounts(prev => [...prev, data]);
      toast.success(`${userToAdd.username} has been linked.`);
      setSearchQuery('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to link account.');
    }
  };

  const handleRemoveAccount = async (userToRemove) => {
    if (!confirm(`Are you sure you want to unlink ${userToRemove.username}?`)) return;
    try {
      await api.delete(`/linked-accounts/${userToRemove.id}`);
      setLinkedAccounts(prev => prev.filter(acc => acc.id !== userToRemove.id));
      toast.success(`${userToRemove.username} has been unlinked.`);
    } catch (error) {
      toast.error('Failed to unlink account.');
    }
  };
  
  const getAvatarUrl = (url) => url?.startsWith('/uploads/') ? `${BASE_URL}${url}` : (url || '/img/default-avatar.png');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Linked Accounts</h2>
      <p className="text-sm text-gray-500 mt-1 mb-8">Manage accounts linked to yours.</p>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-800">Add an account</h3>
        <div className="relative mt-2 max-w-lg">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          />
          {searchResults.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {searchResults.map(user => (
                <li key={user.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <Image src={getAvatarUrl(user.avatar_url)} alt={user.username} width={32} height={32} className="rounded-full" />
                    <span>{user.username}</span>
                  </div>
                  <Button size="sm" onClick={() => handleAddAccount(user)}>Add</Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800">Currently Linked ({linkedAccounts.length})</h3>
        {loading ? <p>Loading...</p> : (
          <ul className="mt-4 space-y-3">
            {linkedAccounts.length > 0 ? linkedAccounts.map(acc => (
              <li key={acc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image src={getAvatarUrl(acc.avatar_url)} alt={acc.username} width={40} height={40} className="rounded-full" />
                  <span className="font-medium">{acc.username}</span>
                </div>
                <Button variant="danger" size="sm" onClick={() => handleRemoveAccount(acc)}>Remove</Button>
              </li>
            )) : <p className="text-gray-500 text-sm">No accounts are linked yet.</p>}
          </ul>
        )}
      </div>
    </div>
  );
}