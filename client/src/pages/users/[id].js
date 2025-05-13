import { useRouter } from 'next/router'  // Import Next.js router to handle dynamic routing
import { useState, useEffect } from 'react'  // Import hooks to manage component state and side effects
import { getUserById } from '../../../services/users'  // Service to fetch user data by ID
import MasonryLayout from '../../../components/layout/MasonryLayout'  // Layout for displaying pins in a grid
import PinCard from '../../../components/pins/PinCard'  // Component to display individual pin cards
import Head from 'next/head'  // Head component for SEO optimization
import { useAuth } from '../../../contexts/AuthContext'  // Custom hook for authentication context

export default function UserProfilePage() {
  const router = useRouter()  // Using the Next.js router for dynamic routing
  const { id } = router.query  // Extract the 'id' query parameter from the URL
  const [user, setUser] = useState(null)  // State to store user data
  const [pins, setPins] = useState([])  // State to store pins created by the user
  const [loading, setLoading] = useState(true)  // Loading state for displaying a spinner while fetching data
  const { user: currentUser } = useAuth()  // Get the current logged-in user from the authentication context

  // Effect hook to fetch user data and pins when the ID is available
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const [userData, userPins] = await Promise.all([  // Fetch user data and pins simultaneously
            getUserById(id),  // Fetch user information
            getPinsByUser(id)  // Fetch pins created by the user
          ])
          setUser(userData)  // Set the fetched user data in the state
          setPins(userPins)  // Set the fetched pins in the state
        } catch (error) {
          console.error('Error fetching user data:', error)  // Log any errors
          router.push('/')  // Redirect to the homepage if an error occurs
        } finally {
          setLoading(false)  // Set loading state to false once data is fetched
        }
      }
      fetchData()  // Call the fetch function when the component mounts
    }
  }, [id, router])  // Re-run the effect when `id` or `router` changes

  return (
    <>
      <Head>
        <title>{user?.username || 'User'} | Pinterest Clone</title> 
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>  
          </div>
        ) : user ? (  
          <>
            <div className="flex items-center mb-8">
              <img
                src={user.avatar_url || '/images/default-avatar.jpg'}  // User avatar
                alt={user.username}
                className="w-20 h-20 rounded-full mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold">{user.username}</h1>  
                <p className="text-gray-600">{user.bio}</p>  
                {currentUser?.id === user.id && (  
                  <button className="mt-2 px-4 py-2 bg-gray-200 rounded-full text-sm">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Pins</h2>
            <MasonryLayout> 
              {pins.map((pin) => (
                <PinCard key={pin.id} pin={pin} /> 
              ))}
            </MasonryLayout>
          </>
        ) : (
          <p>User not found</p>  
        )}
      </div>
    </>
  )
}