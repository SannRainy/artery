// client/src/pages/messages.js
import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContexts';
import { getConversations, getMessages, sendMessage } from '../services/messages';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PaperAirplaneIcon, ArrowLeftIcon } from '@heroicons/react/24/solid'; 
import { formatDate } from '../utils/helpers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function MessagesPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = useCallback(async (conversation) => {
    if (selectedConversation?.conversationId === conversation.conversationId) return;
    
    setSelectedConversation(conversation);
    setLoadingMessages(true);
    setMessages([]);
    try {
      const msgs = await getMessages(conversation.conversationId);
      setMessages(msgs);
    } catch (err) {
      console.error("Gagal memuat pesan:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingConversations(true);
      getConversations()
        .then(data => {
          setConversations(data);
          if (data && data.length > 0 && !selectedConversation) {
            handleSelectConversation(data[0]);
          }
        })
        .catch(err => console.error("Gagal memuat percakapan:", err))
        .finally(() => setLoadingConversations(false));
    }
  }, [isAuthenticated, selectedConversation, handleSelectConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;
    
    setIsSending(true);
    try {
      const sentMessage = await sendMessage(selectedConversation.conversationId, newMessage.trim());
      const messageWithUser = { ...sentMessage, user };
      setMessages(prev => [...prev, messageWithUser]);
      setNewMessage('');
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (authLoading) {
    return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!isAuthenticated) {
    return <div className="h-screen flex items-center justify-center"><p>Silakan login untuk melihat pesan.</p></div>;
  }

  return (
    <>
      <Head><title>Pesan | Artery Project</title></Head>
      <div className="h-screen w-screen flex bg-white overflow-hidden">
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b flex-shrink-0 flex items-center justify-between">
            {/* === PERBAIKAN 1 === */}
            <Link href="/" className="p-2 rounded-full hover:bg-gray-100">
                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
            </Link>
            {/* =================== */}
            <h1 className="text-xl font-bold">Pesan</h1>
            <div className="w-10"></div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {loadingConversations ? (
              <div className="p-4 text-center"><LoadingSpinner /></div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                <p className="mb-4">Anda belum memiliki percakapan. Ikuti seseorang dan mulai mengobrol!</p>
                {/* === PERBAIKAN 2 === */}
                <Link href="/" className="bg-primary text-white font-semibold py-2 px-4 rounded-full">
                    Cari Orang
                </Link>
                {/* =================== */}
              </div>
            ) : (
              conversations.map(convo => (
                <div key={convo.conversationId} onClick={() => handleSelectConversation(convo)}
                  className={`flex items-center p-3 cursor-pointer border-l-4 ${selectedConversation?.conversationId === convo.conversationId ? 'bg-primary-light border-primary' : 'border-transparent hover:bg-gray-50'}`}>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    <Image src={convo.participantAvatar?.startsWith('/uploads/') ? `${BASE_URL}${convo.participantAvatar}` : '/img/default-avatar.png'} layout="fill" objectFit="cover" alt={convo.participantUsername} />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="font-semibold truncate">{convo.participantUsername}</p>
                    <p className="text-sm text-gray-500 truncate">{convo.lastMessage || '...'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="hidden md:flex w-2/3 lg:w-3/4 flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center flex-shrink-0">
                <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Image src={selectedConversation.participantAvatar?.startsWith('/uploads/') ? `${BASE_URL}${selectedConversation.participantAvatar}`: '/img/default-avatar.png'} layout="fill" objectFit="cover" alt={selectedConversation.participantUsername} />
                </div>
                <h2 className="font-semibold">{selectedConversation.participantUsername}</h2>
              </div>
              <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                {loadingMessages ? (
                  <div className="text-center"><LoadingSpinner /></div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex my-2 ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`py-2 px-4 rounded-2xl max-w-lg shadow-sm ${msg.sender_id === user.id ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                        <p className="break-words">{msg.text}</p>
                        <p className={`text-xs mt-1 text-right ${msg.sender_id === user.id ? 'text-blue-100/75' : 'text-gray-500'}`}>{formatDate(msg.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t bg-white flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-grow p-3 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button type="submit" disabled={isSending || !newMessage.trim()} className="ml-3 p-3 rounded-full bg-primary text-white disabled:bg-gray-300 transition-colors">
                    <PaperAirplaneIcon className="h-6 w-6" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              <p>Pilih percakapan untuk memulai chat.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}