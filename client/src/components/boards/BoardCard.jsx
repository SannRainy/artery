import Link from 'next/link'
import { FaEllipsisH } from 'react-icons/fa'

export default function BoardCard({ board }) {
  return (
    <Link href={`/boards/${board.id}`}>
      <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        {board.pins?.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 h-40">
            {board.pins.slice(0, 4).map((pin, index) => (
              <div 
                key={index} 
                className={`relative ${index === 0 && board.pins.length === 1 ? 'col-span-2 row-span-2' : ''}`}
              >
                <img
                  src={pin.image_url || '/images/default-pin.jpg'}
                  alt={pin.title || 'Default Pin Image'}
                  className="w-full h-full object-cover"
                  loading="lazy" // Lazy load images for better performance
                />
                {index === 3 && board.pins.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold">+{board.pins.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-40 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500">No pins yet</span>
          </div>
        )}

        <div className="p-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{board.title}</h3>
            <button className="text-gray-500 hover:text-gray-700" aria-label="More options">
              <FaEllipsisH size={14} />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {board.pins?.length || 0} pins
          </p>
        </div>
      </div>
    </Link>
  )
}
