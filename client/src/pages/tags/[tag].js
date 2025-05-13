import { useRouter } from 'next/router'  // Import Next.js router to handle dynamic routing
import { useState, useEffect } from 'react'  // Import hooks to manage component state and side effects
import { getPinsByTag } from '../../../../services/pins'  // Service to fetch pins by tag
import MasonryLayout from '../../../../components/layout/MasonryLayout'  // Layout for displaying pins in a grid
import PinCard from '../../../../components/pins/PinCard'  // Component to display individual pin cards
import Head from 'next/head'  // Head component for SEO optimization

export default function TagPage() {
  const router = useRouter()  // Using the Next.js router for dynamic routing
  const { tag } = router.query  // Extract the 'tag' query parameter from the URL
  const [pins, setPins] = useState([])  // State to store the pins fetched by tag
  const [loading, setLoading] = useState(true)  // Loading state for displaying a spinner while fetching data

  // Effect hook to fetch pins when the tag changes
  useEffect(() => {
    if (tag) {
      const fetchPins = async () => {
        try {
          const data = await getPinsByTag(tag)  // Fetch pins by the specified tag
          setPins(data)  // Set the fetched pins into state
        } catch (error) {
          console.error('Error fetching pins:', error)  // Log any errors
        } finally {
          setLoading(false)  // Set loading state to false after fetching data
        }
      }
      fetchPins()  // Call the fetch function when the tag changes
    }
  }, [tag])  // Re-run effect when `tag` changes

  return (
    <>
      <Head>
        <title>#{tag} | Pinterest Clone</title> 
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">#{tag}</h1> 
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>  
          </div>
        ) : (
          <MasonryLayout>  
            {pins.map((pin) => (
              <PinCard key={pin.id} pin={pin} />  
            ))}
          </MasonryLayout>
        )}
      </div>
    </>
  )
}
