import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getPinById } from '../../services/pins'  // Service to fetch pin data
import { useAuth } from '../../contexts/AuthContexts'  // Custom hook for user authentication
import PinDetailModal from '../../components/pins/PinDetailModal'  // Modal component to show pin details
import Head from 'next/head'

export default function PinDetailPage() {
  const router = useRouter()  // Use Next.js router to manage routing
  const { id } = router.query  // Extract pin ID from URL query parameters
  const [pin, setPin] = useState(null)  // State to store pin data
  const [loading, setLoading] = useState(true)  // Loading state to show spinner while fetching data
  const { user } = useAuth()  // Fetch user data from context (if needed)

  // Effect hook to fetch pin data when ID is available
  useEffect(() => {
    if (id) {
      const fetchPin = async () => {
        try {
          const data = await getPinById(id)  // Fetch pin data by ID
          setPin(data)  // Set the pin data in state
        } catch (error) {
          console.error('Error fetching pin:', error)  // Log error if fetching fails
          router.push('/')  // Redirect to homepage if pin not found or error occurs
        } finally {
          setLoading(false)  // Set loading to false once fetching is done
        }
      }
      fetchPin()  // Trigger fetch on ID change
    }
  }, [id, router])  // Re-run effect when `id` or `router` changes

  // If the pin is still loading or not found, show a loading spinner
  if (loading || !pin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>  // Loading spinner
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{pin.title} | Artery Project</title>  {/* Dynamic page title for SEO */}
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <PinDetailModal 
          pin={pin}  // Passing the pin data to the modal component
          onClose={() => router.push('/')}  // Close handler to redirect to homepage
        />
      </div>
    </>
  )
}
