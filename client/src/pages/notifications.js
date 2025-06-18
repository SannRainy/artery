// client/src/pages/notifications.js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContexts';
import { getNotifications, markNotificationsAsRead } from '../services/notifications';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Header from '../components/layout/Header';
import { BellIcon as BellOutlineIcon, MegaphoneIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon, HeartIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const IkonNotifikasi = ({ tipe }) => {
  const baseClass = "h-6 w-6 text-white";
  switch (tipe) {
    case 'follow':
      return <div className="p-2 bg-blue-500 rounded-full"><UserGroupIcon className={baseClass} /></div>;
    case 'like':
      return <div className="p-2 bg-red-500 rounded-full"><HeartIcon className={baseClass} /></div>;
    case 'comment':
      return <div className="p-2 bg-green-500 rounded-full"><ChatBubbleBottomCenterTextIcon className={baseClass} /></div>;
    default:
      return <div className="p-2 bg-gray-500 rounded-full"><BellOutlineIcon className={baseClass} /></div>;
  }
};

const NotificationItem = ({ notif }) => {
  let message = '';
  let link = '/';

  switch (notif.type) {
    case 'follow':
      message = 'mulai mengikuti Anda.';
      link = `/users/${notif.actorId}`;
      break;
    case 'like':
      message = 'menyukai pin Anda.';
      link = `/pins/${notif.entity_id}`;
      break;
    case 'comment':
      message = 'mengomentari pin Anda.';
      link = `/pins/${notif.entity_id}`;
      break;
    default:
      message = 'memberi notifikasi baru.';
  }

  // === PERBAIKAN UTAMA DI SINI ===
  // Logika yang lebih aman untuk menentukan path avatar aktor
  let actorAvatarSrc = '/img/default-avatar.png'; // Default fallback
  if (notif.actorAvatar) {
    if (notif.actorAvatar.startsWith('/uploads/')) {
      actorAvatarSrc = `${BASE_URL}${notif.actorAvatar}`;
    } else {
      // Asumsikan path lain adalah path lokal yang valid (seperti /img/default-avatar.png)
      actorAvatarSrc = notif.actorAvatar;
    }
  }

  // Logika untuk thumbnail pin
  const pinThumbnailSrc = notif.pinThumbnail?.startsWith('/uploads/') 
    ? `${BASE_URL}${notif.pinThumbnail}` 
    : notif.pinThumbnail;
  // ================================

  return (
    <Link
      href={link}
      className={`flex items-start p-4 gap-4 transition-colors duration-200 ${notif.is_read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}`}
    >
      <IkonNotifikasi tipe={notif.type} />
      <div className="flex-grow flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {/* Gunakan variabel actorAvatarSrc yang sudah diproses */}
          <Image src={actorAvatarSrc} layout="fill" objectFit="cover" alt={notif.actorUsername} key={actorAvatarSrc} />
        </div>
        <div>
            <p className="text-sm text-gray-800">
                <span className="font-bold">{notif.actorUsername}</span> {message}
            </p>
            <p className="text-xs text-gray-500 mt-1">{formatDate(notif.created_at)}</p>
        </div>
      </div>
      {notif.type !== 'follow' && pinThumbnailSrc && (
        <div className="relative w-14 h-14 rounded-lg overflow-hidden ml-4 flex-shrink-0">
          <Image src={pinThumbnailSrc} layout="fill" objectFit="cover" alt="Pin thumbnail" />
        </div>
      )}
    </Link>
  );
};

// Data dummy untuk kolom kanan (tidak berubah)
const dummyAnnouncements = [
    { id: 1, title: "Update Pemeliharaan", message: "Akan ada maintenance server terjadwal pada hari Sabtu pukul 02:00 WIB.", time: "2 hari lalu" },
    { id: 2, title: "Fitur Baru: Boards!", message: "Sekarang Anda dapat mengelompokkan pin favorit Anda ke dalam board. Coba sekarang!", time: "5 hari lalu" },
];

export default function NotificationsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const markAsRead = useCallback(() => {
    // Cek jika ada notifikasi yang belum dibaca sebelum mengirim request
    const hasUnread = notifications.some(n => !n.is_read);
    if (hasUnread) {
        markNotificationsAsRead().catch(err => console.error("Gagal menandai notifikasi:", err));
    }
  }, [notifications]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      getNotifications()
        .then(data => setNotifications(data))
        .catch(err => console.error("Gagal memuat notifikasi:", err))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleFocus = () => markAsRead();
    window.addEventListener('focus', handleFocus);
    const timer = setTimeout(markAsRead, 3000); 

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearTimeout(timer);
    };
  }, [markAsRead]);

  if (authLoading) {
    return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }
  
  if (!isAuthenticated) {
    return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <Head><title>Notifikasi | Artery Project</title></Head>
      <main className="container mx-auto max-w-6xl px-4 pt-24 pb-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Kembali ke beranda">
            <ArrowLeftIcon className="h-6 w-6 text-gray-800" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Pemberitahuan</h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3 bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold">Aktivitas Terbaru</h2>
            </div>
            <div>
              {loading ? (
                <div className="p-8 text-center"><LoadingSpinner /></div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {notifications.map(notif => <NotificationItem key={notif.id} notif={notif} />)}
                </div>
              ) : (
                <p className="text-center text-gray-500 p-8">Tidak ada aktivitas terbaru untuk Anda.</p>
              )}
            </div>
          </div>
          <div className="w-full lg:w-1/3">
             <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-bold">Pengumuman</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {dummyAnnouncements.map(item => (
                        <div key={item.id} className="p-4">
                            <div className='flex items-center gap-3 mb-2'>
                                <MegaphoneIcon className="h-5 w-5 text-primary"/>
                                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600">{item.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{item.time}</p>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}