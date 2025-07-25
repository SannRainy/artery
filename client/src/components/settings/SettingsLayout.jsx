// File baru: src/components/settings/SettingsLayout.jsx
import SettingsSidebar from './SettingsSidebar';

export default function SettingsLayout({ children, activeTab }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola informasi profil dan preferensi akun Anda.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-1/4 flex-shrink-0">
              <SettingsSidebar active={activeTab} />
            </div>
            <div className="w-full md:w-3/4 bg-white p-8 rounded-lg shadow">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}