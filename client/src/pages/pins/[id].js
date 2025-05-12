import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getPinById } from '../../../services/pins'
import { useAuth } from '../../../contexts/AuthContext'
import PinDetailModal from '../../../components/pins/PinDetailModal'
import Head from 'next/head'

export default function PinDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [pin, setPin] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (id) {
      const fetchPin = async () => {
        try {
          const data = await getPinById(id)
          setPin(data)
        } catch (error) {
          console.error('Error fetching pin:', error)
          router.push('/')
        } finally {
          setLoading(false)
        }
      }
      fetchPin()
    }
  }, [id, router])

  if (loading || !pin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{pin.title} | Pinterest Clone</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <PinDetailModal 
          pin={pin} 
          onClose={() => router.push('/')}
        />
      </div>
    </>
  )
}