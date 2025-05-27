import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContexts';
import '../styles/global.css';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      // Optional analytics or logic
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Component {...pageProps} />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default MyApp;
