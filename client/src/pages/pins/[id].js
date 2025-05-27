import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getPinById } from '../../services/pins'
import { useAuth } from '../../contexts/AuthContexts'
import PinDetailModal from '../../components/pins/PinDetailModal'
import Head from 'next/head'

export default function PinDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [pin, setPin] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()  // Kalau butuh info user, misalnya untuk like button, dsb

  useEffect(() => {
    if (!id) return

    const fetchPin = async () => {
      try {
        const data = await getPinById(id)
        setPin(data)
      } catch (error) {
        console.error('Error fetching pin:', error)
        router.push('/') // Redirect ke homepage jika gagal load pin
      } finally {
        setLoading(false)
      }
    }

    fetchPin()
  }, [id, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    )
  }

  if (!pin) {
    // Kalau data pin tidak ada setelah loading selesai, bisa redirect atau tampilkan pesan
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Pin not found.</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{pin.title} | Artery Project</title>
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
