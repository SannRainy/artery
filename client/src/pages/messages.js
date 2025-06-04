// client/src/pages/messages.js
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Impor Link
import { useAuth } from '../contexts/AuthContexts';
// import Header from '../components/layout/Header'; // Komentari jika Header ada di _app.js
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { FiMessageSquare, FiSend, FiUser, FiHome, FiArrowLeft } from 'react-icons/fi'; // Tambahkan FiHome atau FiArrowLeft

// Contoh data chat dummy (Anda akan menggantinya dengan data dari API)
const dummyConversations = [
  { id: 1, userName: 'User Lain', lastMessage: 'Oke, sampai jumpa besok!', unread: 2, avatar: '/img/default-avatar.png' },
  { id: 2, userName: 'Jane Doe', lastMessage: 'Terima kasih infonya!', unread: 0, avatar: null },
];

const dummyMessages = {
  1: [
    { id: 'm1', sender: 'User Lain', text: 'Hei, apa kabar?', time: '10:00' },
    { id: 'm2', sender: 'You', text: 'Baik! Kamu gimana?', time: '10:01' },
  ],
  2: [
    { id: 'm5', sender: 'Jane Doe', text: 'Halo!', time: 'Kemarin' },
  ]
};

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?returnUrl=/messages');
    } else if (user && !authLoading) { 
      setLoadingData(true);
      setTimeout(() => { 
        setConversations(dummyConversations);
        setLoadingData(false);
      }, 500);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (selectedConversationId) {
      setLoadingData(true);
      setTimeout(() => { 
        setMessages(dummyMessages[selectedConversationId] || []);
        setLoadingData(false);
      }, 300);
    } else {
      setMessages([]); 
    }
  }, [selectedConversationId]);

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;
    
    const newMsgObject = {
        id: `m${Date.now()}`,
        sender: 'You', 
        text: newMessage.trim(),
        time: 'Baru saja'
    };
    setMessages(prev => [...prev, newMsgObject]);
    setNewMessage('');
    console.log('Sending message:', newMessage, 'to conversation:', selectedConversationId);
  };

  if (authLoading) { 
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!user) {
    return null; 
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <>
      <Head>
        <title>Pesan | Artery Project</title>
      </Head>
      {/* Jika Header adalah komponen global di _app.js, baris ini tidak perlu */}
      {/* <Header /> */}

      {/* Kontainer utama */}
      <div className="container mx-auto flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] mt-20 md:mt-20"> {/* Sesuaikan margin atas dengan tinggi Header Anda */}
        {/* Baris untuk tombol kembali dan judul halaman (opsional) */}
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg shadow">
          <button 
              onClick={() => router.push('/')} // Mengarahkan ke Beranda
              className="flex items-center text-sm text-gray-600 hover:text-primary transition"
              title="Kembali ke Beranda"
          >
              <FiArrowLeft className="h-5 w-5 mr-2" />
              Beranda
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Pesan</h1>
          <div className="w-16"></div> {/* Spacer agar judul terpusat */}
        </div>

        <div className="flex flex-1 border border-t-0 rounded-b-lg shadow-lg bg-white overflow-hidden">
            {/* Sidebar Daftar Percakapan */}
            <aside className={`w-full sm:w-2/5 md:w-1/3 lg:w-1/4 border-r flex flex-col ${selectedConversationId && 'hidden sm:flex'}`}> {/* Sembunyikan di mobile jika chat dipilih */}
            {/* <div className="p-3 border-b sticky top-0 bg-white z-10">
                <Input type="search" placeholder="Cari percakapan..." className="!mt-0 w-full" />
            </div> */}
            <div className="flex-grow overflow-y-auto">
                {loadingData && conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 flex items-center justify-center h-full"><LoadingSpinner size="sm"/></div>
                ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                    <FiMessageSquare className="text-4xl mb-2"/>
                    <span>Tidak ada percakapan.</span>
                </div>
                ) : (
                conversations.map(convo => (
                    <div
                    key={convo.id}
                    className={`p-3 hover:bg-gray-100 cursor-pointer border-b flex items-center space-x-3 ${selectedConversationId === convo.id ? 'bg-primary-light border-l-4 border-primary' : 'border-transparent'}`}
                    onClick={() => handleSelectConversation(convo.id)}
                    >
                    <div className="relative w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                        {convo.avatar && convo.avatar !== '/img/default-avatar.png' ? (
                            <Image src={convo.avatar.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${convo.avatar}` : convo.avatar} alt={convo.userName} layout="fill" objectFit="cover" />
                        ): (
                            <FiUser className="w-6 h-6 text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium text-sm text-gray-800 truncate">{convo.userName}</h3>
                            {convo.unread > 0 && (
                                <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{convo.unread}</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{convo.lastMessage}</p>
                    </div>
                    </div>
                ))
                )}
            </div>
            </aside>

            {/* Area Chat Utama */}
            <section className={`w-full sm:w-3/5 md:w-2/3 lg:w-3/4 flex flex-col bg-gray-50 ${!selectedConversationId && 'hidden sm:flex'}`}> {/* Tampilkan jika ada percakapan dipilih, atau selalu di layar besar */}
            {selectedConversationId && selectedConversation ? (
                <>
                <header className="p-3 sm:p-4 border-b flex items-center space-x-3 bg-white shadow-sm">
                    {/* Tombol kembali di mobile jika chat dipilih */}
                    <button onClick={() => setSelectedConversationId(null)} className="sm:hidden p-1 text-gray-600 hover:text-primary">
                        <FiArrowLeft className="h-5 w-5"/>
                    </button>
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                        {selectedConversation.avatar && selectedConversation.avatar !== '/img/default-avatar.png' ? (
                            <Image src={selectedConversation.avatar.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${selectedConversation.avatar}` : selectedConversation.avatar} alt={selectedConversation.userName} layout="fill" objectFit="cover" />
                        ): (
                            <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                        )}
                    </div>
                    <h2 className="font-semibold text-gray-800">{selectedConversation.userName}</h2>
                </header>
                <div className="flex-grow p-4 space-y-4 overflow-y-auto" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
                    {loadingData && messages.length === 0 ? (
                        <div className="text-center py-10 text-gray-500"><LoadingSpinner size="sm"/></div>
                    ): messages.map(msg => (
                    <div key={msg.id} className={`flex mb-2 ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] lg:max-w-[60%] px-3 py-2 rounded-xl ${
                            msg.sender === 'You' ? 'bg-primary text-white rounded-br-none' : 'bg-white shadow rounded-bl-none'
                        }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'You' ? 'text-primary-light opacity-75' : 'text-gray-400'} text-right`}>{msg.time}</p>
                        </div>
                    </div>
                    ))}
                </div>
                <footer className="p-3 sm:p-4 border-t bg-gray-100">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <Input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ketik pesan Anda..." className="flex-1 !mt-0" autoComplete="off" />
                    <Button type="submit" disabled={!newMessage.trim() || loadingData} className="p-2.5 bg-primary hover:bg-primary-dark">
                        <FiSend className="h-5 w-5 text-white" />
                    </Button>
                    </form>
                </footer>
                </>
            ) : (
                <div className="flex-grow flex-col items-center justify-center text-gray-400 hidden sm:flex"> {/* Sembunyikan di mobile jika tidak ada chat dipilih */}
                <FiMessageSquare className="text-5xl sm:text-6xl mb-4" />
                <p className="text-sm sm:text-base">Pilih percakapan untuk memulai.</p>
                </div>
            )}
            </section>
        </div>
      </div>
    </>
  );
}