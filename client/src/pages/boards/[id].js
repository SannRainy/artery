import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { getBoardById } from '../../../services/boards'
import MasonryLayout from '../../../components/layout/MasonryLayout'
import PinCard from '../../../components/pins/PinCard'
import Head from 'next/head'

export default function BoardPage() {
  const router = useRouter()  // Accessing the router object to get query parameters (board ID)
  const { id } = router.query  // Extracting board ID from the URL query parameters
  const [board, setBoard] = useState(null)  // State to store the fetched board data
  const [loading, setLoading] = useState(true)  // State to manage the loading state

  // Effect hook to fetch the board data when the component mounts or the ID changes
  useEffect(() => {
    if (id) {
      const fetchBoard = async () => {
        try {
          const data = await getBoardById(id)  // Fetching board data by ID
          setBoard(data)  // Updating the state with the fetched board data
        } catch (error) {
          console.error('Error fetching board:', error)  // Logging the error if something goes wrong
          router.push('/')  // Redirecting to the home page if the board is not found
        } finally {
          setLoading(false)  // Stopping the loading state
        }
      }
      fetchBoard()
    }
  }, [id, router])  // Dependencies: runs the effect whenever `id` or `router` changes

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
