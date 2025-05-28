import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContexts'
import { likePin, unlikePin } from '../../services/pins'
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'

export default function PinCard({ pin }) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(pin.is_liked)
  const [likeCount, setLikeCount] = useState(pin.like_count)

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePin(pin.id)
        setLikeCount((prevCount) => prevCount - 1)
      } else {
        await likePin(pin.id)
        setLikeCount((prevCount) => prevCount + 1)
      }
      setIsLiked((prevState) => !prevState)
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  return (
    <div className="mb-6 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
      <Link href={`/pins/${pin.id}`}>
        <div className="relative cursor-zoom-in">
          <img
            src={pin.image_url?.startsWith('/uploads/') ? `${BASE_URL}${pin.image_url}` : '/img/default-pin.png'}
            
            alt={pin.title || 'Pin image'}
            className="w-full h-auto object-cover"
          />

          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-end p-4">
            <div className="w-full">
              <h3 className="text-white font-bold text-lg drop-shadow-md">{pin.title}</h3>
              {pin.description && (
                <p className="text-white text-sm line-clamp-2 drop-shadow-md">
                  {pin.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="p-3">
        <div className="flex justify-between items-center mb-2 sm:flex-col sm:items-start">
          {/* Display tags if available */}
          {pin.tags?.length > 0 && (
            <div className="flex items-center space-x-2">
              {pin.tags.slice(0, 2).map((tag) => (
                <span key={tag.id} className="bg-gray-100 text-xs px-2 py-1 rounded-full">
                  #{tag.name}
                </span>
              ))}
              {pin.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{pin.tags.length - 2}</span>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center space-x-1 ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLiked ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart className="text-gray-500" />
              )}
              <span className="text-xs">{likeCount}</span>
            </button>

            {/* Comment button */}
            <Link href={`/pins/${pin.id}#comments`}>
              <div className="flex items-center space-x-1">
                <FaComment className="text-gray-500" />
                <span className="text-xs">{pin.comment_count || 0}</span>
              </div>
            </Link>
          </div>
        </div>

        {/* User profile */}
        <Link href={`/users/${pin.user_id}`}>
          <div className="flex items-center space-x-2 cursor-pointer">
            <img
              src={pin.user?.avatar_url || '/img/default-avatar.png'}
              alt={pin.user?.username}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm font-medium">{pin.user?.username}</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
