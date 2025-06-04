// client/src/pages/notifications.js
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Impor Link untuk tombol Beranda
import { useAuth } from '../contexts/AuthContexts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FiBell, FiHome } from 'react-icons/fi'; // Impor FiHome untuk ikon Beranda

// Contoh data notifikasi dummy
const dummyNotifications = [
  { id: 1, type: 'like', message: 'Seseorang menyukai pin Anda: "Pixel Art Keren".', time: '2 jam lalu', read: false, link: '/pins/123' },
  { id: 2, type: 'comment', message: 'User Lain mengomentari pin Anda: "Pemandangan Indah".', time: '5 jam lalu', read: true, link: '/pins/124' },
  { id: 3, type: 'follow', message: 'Jane Doe mulai mengikuti Anda.', time: '1 hari lalu', read: false, link: '/users/jane-doe' },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?returnUrl=/notifications');
    } else if (user) {
      setTimeout(() => { 
        setNotifications(dummyNotifications);
        setLoadingNotifications(false);
      }, 1000);
    }
  }, [user, authLoading, router]);

  if (authLoading || (!user && !authLoading)) { 
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!user) {
    return null; 
  }

  return (
    <>
      <Head>
        <title>Notifikasi | Artery Project</title>
      </Head>

      <main className="container mx-auto px-4 py-8 pt-24 md:pt-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 pb-4 border-b">
            Notifikasi
          </h1>

          {loadingNotifications ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10">
              <FiBell className="mx-auto text-5xl text-gray-300 mb-4" />
              <p className="text-gray-500">Tidak ada notifikasi baru.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => notif.link && router.push(notif.link)}
                  className={`block p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
                    notif.read ? 'bg-white' : 'bg-primary-light border-l-4 border-primary'
                  }`}
                >
                  <p className={`text-sm ${notif.read ? 'text-gray-700' : 'text-gray-800 font-medium'}`}>{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tombol Kembali ke Beranda */}
          <div className="mt-12 text-center"> {/* Margin atas untuk jarak */}
            <Link 
              href="/" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition"
            >
              <FiHome className="mr-2 h-5 w-5" />
              Kembali ke Beranda
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}