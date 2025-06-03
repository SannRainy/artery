import Link from 'next/link';

const UserActivity = ({ activities }) => { //
  if (!activities || activities.length === 0) { //
    return (
      <div className="text-center py-8 text-gray-500">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => ( //
        <div key={`${activity.type}-${activity.id}`} className="border-b border-gray-200 pb-4">
          <Link href={`/${activity.type}s/${activity.id}`}>
            <div className="hover:bg-gray-50 p-2 rounded cursor-pointer">
              <p className="text-gray-700">
                {activity.type === 'pin' ? 'Created pin' : 'Created board'}: {activity.title}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(activity.created_at).toLocaleString()}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default UserActivity;