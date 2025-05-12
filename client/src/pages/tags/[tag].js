import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { getPinsByTag } from '../../../../services/pins'
import MasonryLayout from '../../../../components/layout/MasonryLayout'
import PinCard from '../../../../components/pins/PinCard'
import Head from 'next/head'

export default function TagPage() {
  const router = useRouter()
  const { tag } = router.query
  const [pins, setPins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tag) {
      const fetchPins = async () => {
        try {
          const data = await getPinsByTag(tag)
          setPins(data)
        } catch (error) {
          console.error('Error fetching pins:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchPins()
    }
  }, [tag])

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