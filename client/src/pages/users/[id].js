import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { getUserById } from '../../../services/users'
import MasonryLayout from '../../../components/layout/MasonryLayout'
import PinCard from '../../../components/pins/PinCard'
import Head from 'next/head'
import { useAuth } from '../../../contexts/AuthContext'

export default function UserProfilePage() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const [pins, setPins] = useState([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const [userData, userPins] = await Promise.all([
            getUserById(id),
            getPinsByUser(id)
          ])
          setUser(userData)
          setPins(userPins)
        } catch (error) {
          console.error('Error fetching user data:', error)
          router.push('/')
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [id, router])

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
                src={user.avatar_url || '/images/default-avatar.jpg'}
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