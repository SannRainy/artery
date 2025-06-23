// client/src/components/settings/SettingsSidebar.jsx
import Link from 'next/link';
import { 
  UserCircleIcon, 
  CreditCardIcon, // Contoh Ikon untuk Payment
  ShieldCheckIcon, 
  Cog8ToothIcon,
  BellIcon,
  UserPlusIcon // Contoh Ikon untuk Add Passengers
} from '@heroicons/react/24/outline';

export default function SettingsSidebar({ active = 'profile' }) {
  const navItems = [
    { 
      id: 'profile', 
      label: 'Personal details', 
      href: '/settings/profile', 
      icon: UserCircleIcon 
    },
    { 
      id: 'payment', 
      label: 'Payment Information', 
      href: '/settings/payment', // Tautan baru
      icon: CreditCardIcon
    },
    { 
      id: 'safety', 
      label: 'Safety', 
      href: '/settings/safety', // Tautan baru
      icon: ShieldCheckIcon 
    },
    { 
      id: 'preference',
      label: 'Preferences', 
      href: '/settings/preferences',
      icon: Cog8ToothIcon 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      href: '/settings/notifications', // Tautan baru
      icon: BellIcon 
    },
     { 
      id: 'passengers', 
      label: 'Add other passengers', 
      href: '/settings/passengers', // Tautan baru
      icon: UserPlusIcon 
    },
  ];

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map(item => (
        <Link 
          key={item.id}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-150 ${
            active === item.id 
              ? 'bg-blue-100 text-blue-700' // Gaya aktif yang lebih menonjol
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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