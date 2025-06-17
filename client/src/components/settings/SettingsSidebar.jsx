// client/src/components/settings/SettingsSidebar.jsx
import Link from 'next/link';
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  BellIcon,
  LockClosedIcon,
  Cog8ToothIcon 
} from '@heroicons/react/24/outline';


export default function SettingsSidebar({ active = 'profile' }) {
  const navItems = [
    { 
      id: 'profile', 
      label: 'Profil Publik', 
      href: '/settings/profile', 
      icon: UserCircleIcon 
    },

    { 
      id: 'account', 
      label: 'Keamanan Akun', 
      href: '#', 
      icon: ShieldCheckIcon 
    },
    { 
      id: 'preferences', 
      label: 'Preferensi', 
      href: '#', 
      icon: Cog8ToothIcon 
    },
    { 
      id: 'privacy', 
      label: 'Privasi & Data', 
      href: '#', 
      icon: LockClosedIcon 
    },
    { 
      id: 'notifications', 
      label: 'Notifikasi', 
      href: '#', 
      icon: BellIcon 
    },
  ];

  return (

    <nav className="flex flex-col space-y-1 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
      {navItems.map(item => (
        <Link 
          key={item.id}
          href={item.href}

          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-150 ${
            active === item.id 
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
          aria-current={active === item.id ? 'page' : undefined}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}