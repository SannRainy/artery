// client/src/components/layout/Footer.jsx
import Link from 'next/link';
import { FiZap } from 'react-icons/fi'; // Menggunakan ikon generik sebagai contoh

export default function Footer() {
  return (
    <footer className="w-full mt-12 py-8 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Bagian Kiri: Logo dan Copyright */}
          <div className="text-center md:text-left">
            <Link href="/" className="flex items-center justify-center md:justify-start gap-2 mb-2 text-xl font-bold text-gray-800 hover:text-primary transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <FiZap className="h-5 w-5" />
                </div>
                <span>Artery</span>
            </Link>
            <p className="text-sm text-gray-500">
              Your favorite art sharing service.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Uizard © {new Date().getFullYear()}
            </p>
          </div>

          {/* Bagian Kanan: Link Bantuan */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm font-medium text-gray-600">
            <Link href="/help" className="hover:text-primary transition-colors">Help</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link href="/guides" className="hover:text-primary transition-colors">How to guide</Link>
            <Link href="/support" className="hover:text-primary transition-colors">Customer service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}