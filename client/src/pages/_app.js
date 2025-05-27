import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContexts';
import '../styles/global.css';
import { useRouter } from 'next/router';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Optional: Add route change handlers
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Add analytics tracking or other route change logic
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <AuthProvider>
      {/* Add default meta tags that can be overridden by individual pages */}
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;