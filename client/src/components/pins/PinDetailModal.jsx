import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { likePin, unlikePin, addComment } from '../../services/pins'
import { FaHeart, FaRegHeart, FaComment, FaShare } from 'react-icons/fa'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function PinDetailModal({ pin, onClose }) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(pin.is_liked)
  const [likeCount, setLikeCount] = useState(pin.like_count)
  const [comments, setComments] = useState(pin.comments || [])
  const [commentText, setCommentText] = useState('')

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePin(pin.id)
        setLikeCount(likeCount - 1)
      } else {
        await likePin(pin.id)
        setLikeCount(likeCount + 1)
      }
      setIsLiked(!isLiked)
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      const newComment = await addComment(pin.id, commentText)
      setComments([...comments, newComment])
      setCommentText('')
    } catch (err) {
      console.error('Error adding comment:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{pin.title}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>

            <div className="mt-4 flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <img
                  src={pin.image_url}
                  alt={pin.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>

              <div className="md:w-1/3 space-y-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={pin.user?.avatar_url || '/images/default-avatar.jpg'}
                    alt={pin.user?.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{pin.user?.username}</span>
                </div>

                {pin.description && (
                  <p className="text-gray-700">{pin.description}</p>
                )}

                {pin.link_url && (
                  <a 
                    href={pin.link_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline block"
                  >
                    {new URL(pin.link_url).hostname}
                  </a>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!user}
                  >
                    {isLiked ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart className="text-gray-500" />
                    )}
                    <span>{likeCount}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <FaComment className="text-gray-500" />
                    <span>{comments.length}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Comments</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-2">
                        <img
                          src={comment.avatar_url || '/images/default-avatar.jpg'}
                          alt={comment.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm">{comment.username}</p>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {user && (
                    <form onSubmit={handleCommentSubmit} className="mt-4">
                      <div className="flex space-x-2">
                        <Input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment"
                          className="flex-1"
                        />
                        <Button type="submit">Post</Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
