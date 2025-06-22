// client/src/components/profile/ProfileSidebar.jsx
import { FiMapPin, FiFlag, FiCalendar } from 'react-icons/fi';

const ProfileSidebar = ({ user, activeTab, setActiveTab }) => { 
  const tabs = [ 
    { id: 'pins', label: 'Pins' }, 
    { id: 'activity', label: 'Activity' }, 
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-24">
      <div className="space-y-1">
        {tabs.map((tab) => ( 
          <button
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition font-medium ${
              activeTab === tab.id 
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4 text-lg">Details</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          {user.location && (
            <li className="flex items-center gap-3">
              <FiMapPin className="h-4 w-4 text-gray-400" />
              <span>{user.location}</span>
            </li>
          )}
          {user.nationality && (
            <li className="flex items-center gap-3">
              <FiFlag className="h-4 w-4 text-gray-400" />
              <span>{user.nationality}</span>
            </li>
          )}
          {user.date_of_birth && (
            <li className="flex items-center gap-3">
              <FiCalendar className="h-4 w-4 text-gray-400" />
              <span>Lahir {formatDate(user.date_of_birth)}</span>
            </li>
          )}
           <li className="flex items-center gap-3">
              <FiCalendar className="h-4 w-4 text-gray-400" />
              <span>Bergabung {formatDate(user.created_at)}</span>
            </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileSidebar;