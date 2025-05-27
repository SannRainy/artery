const ProfileSidebar = ({ user, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'pins', label: 'Pins' },
    { id: 'boards', label: 'Boards' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-4">
      <div className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">Details</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="font-medium">Joined:</span>
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </li>
          {user.bio && (
            <li className="flex items-center gap-2">
              <span className="font-medium">Bio:</span>
              <span>{user.bio}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProfileSidebar;