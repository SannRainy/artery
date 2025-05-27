// pages/404.js
import Link from 'next/link';
import Head from 'next/head';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link 
  href="/login" 
  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
>
  Return Home
</Link>

      </div>
    </>
  );
}