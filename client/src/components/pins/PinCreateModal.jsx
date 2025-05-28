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
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data) => {
    try { 
      setIsLoading(true)
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('image_url', data.image_url[0])

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }
      await createPin(formData)
      console.log('Pin created!')
      onPinCreated && onPinCreated()
      handleClose()
    } catch (error) {
      console.error('Error creating pin:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }
};  

  const handleClose = () => {
  reset()
  setImagePreview(null)
  setValue('image_url', null)
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
              <label
                htmlFor="image"
                className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
              >
                Select File
              </label>
              <input
                  id="image"  
                  type="file"
                  className="hidden"
                  accept="image/*"
                  {...register('image_url', {
                    required: 'Image is required',
                    validate: {
                      notEmpty: files => files && files.length > 0 || 'Image is required',
                      isImage: files => files[0]?.type.startsWith('image/') || 'File must be an image',
                      isSmall: files => files[0]?.size < 5 * 1024 * 1024 || 'Max file size is 5MB'
                    }
                  })}
                  onChange={handleImageChange}
                />

            </div>
          )}
          {errors.image_url && (
            <p className="text-red-500 text-sm mt-2">{errors.image_url.message}</p>
          )}
        </div>

        <Input
          label="Title"
          id="title"
          {...register('title', { required: 'Title is required' })}
          error={errors.title}
        />

        <Textarea
          label="Description"
          id="description"
          {...register('description')}
          rows={3}
        />

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
