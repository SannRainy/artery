import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { getBoardById } from '../../../services/boards'
import MasonryLayout from '../../../components/layout/MasonryLayout'
import PinCard from '../../../components/pins/PinCard'
import Head from 'next/head'

export default function BoardPage() {
  const router = useRouter()
  const { id } = router.query
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchBoard = async () => {
        try {
          const data = await getBoardById(id)
          setBoard(data)
        } catch (error) {
          console.error('Error fetching board:', error)
          router.push('/')
        } finally {
          setLoading(false)
        }
      }
      fetchBoard()
    }
  }, [id, router])

  return (
    <>
      <Head>
        <title>{board?.title || 'Board'} | Pinterest Clone</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : board ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold">{board.title}</h1>
              <p className="text-gray-600">{board.description}</p>
              <div className="flex items-center mt-2">
                <img
                  src={board.user.avatar_url || '/images/default-avatar.jpg'}
                  alt={board.user.username}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-sm">{board.user.username}</span>
              </div>
            </div>

            <MasonryLayout>
              {board.pins.map((pin) => (
                <PinCard key={pin.id} pin={pin} />
              ))}
            </MasonryLayout>
          </>
        ) : (
          <p>Board not found</p>
        )}
      </div>
    </>
  )
}