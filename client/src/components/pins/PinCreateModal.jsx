import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContexts'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import { createPin } from '../../services/pins'

export default function PinCreateModal({ isOpen, onClose, onPinCreated }) {
  const { user } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState([])

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const value = e.target.value.trim()
      if (value && !tags.includes(value)) {
        setTags([...tags, value])
      }
      e.target.value = ''
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('tags', JSON.stringify(tags))
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0])
      }
      // Optional: kirim user id jika backend butuh
      formData.append('user_id', user?.id)

      const newPin = await createPin(formData)
      onPinCreated(newPin)
      handleClose()
    } catch (err) {
      console.error('Error creating pin:', err)
      alert('Gagal membuat pin, coba lagi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClose = () => {
    reset()
    setImagePreview(null)
    setTags([])
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Pin">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-64 object-contain rounded-lg"
            />
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-2">Upload an image</p>
              <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition">
                Select File
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  {...register('image', { required: 'Image is required' })}
                  onChange={handleImageChange}
                />
              </label>
            </div>
          )}
          {errors.image && (
            <p className="text-red-500 text-sm mt-2">{errors.image.message}</p>
          )}
        </div>

        <Input
          label="Title"
          {...register('title', { required: 'Title is required' })}
          error={errors.title}
        />

        <Textarea
          label="Description"
          {...register('description')}
          rows={3}
        />

        <div>
          <label className="block mb-1 font-semibold">Tags</label>
          <input
            type="text"
            placeholder="Tulis tag lalu tekan Enter atau koma"
            onKeyDown={handleTagKeyDown}
            className="border rounded px-3 py-2 w-full"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span key={tag} className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center space-x-2">
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            className="bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Pin'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
