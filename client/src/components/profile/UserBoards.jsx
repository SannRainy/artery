import Link from 'next/link';

const UserBoards = ({ boards }) => {
  if (!boards || boards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No boards found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {boards.map((board) => (
        <Link key={board.id} href={`/boards/${board.id}`}>
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-semibold">{board.title}</h3>
            <p className="text-gray-600 text-sm mt-2">
              {board.description || 'No description'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {board.is_private ? 'Private' : 'Public'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default UserBoards;