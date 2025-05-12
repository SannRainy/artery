import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import MasonryLayout from '../components/layout/MasonryLayout'
import PinCard from '../components/pins/PinCard'
import PinCreateModal from '../components/pins/PinCreateModal'
import { getPins } from '../services/pins'
import Button from '../components/ui/Button'
import { FiPlus } from 'react-icons/fi'

export default function Home() {
  const { user } = useAuth()
  const [pins, setPins] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const data = await getPins()
        setPins(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPins()
  }, [])

  const handlePinCreated = (newPin) => {
    setPins([newPin, ...pins])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {user && (
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white"
          >
            <FiPlus /> Create Pin
          </Button>
        </div>
      )}

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

      <PinCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPinCreated={handlePinCreated}
      />
    </div>
  )
}