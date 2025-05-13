import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'

export default function BoardCreateModal({ isOpen, onClose, onBoardCreated }) {
  const { user } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      // Call API to create board
      const newBoard = { ...data, user_id: user.id }
      onBoardCreated(newBoard)
      handleClose()
    } catch (err) {
      console.error('Error creating board:', err)
      setErrorMessage('An error occurred while creating the board. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setErrorMessage('') // Clear error message on close
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Board">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="text-red-600 text-sm">{errorMessage}</div>
        )}

        <Input
          label="Title"
          {...register('title', { 
            required: 'Title is required',
            minLength: {
              value: 3,
              message: 'Title must be at least 3 characters'
            },
            maxLength: {
              value: 50,
              message: 'Title must be less than 50 characters'
            }
          })}
          error={errors.title}
        />

        <Textarea
          label="Description"
          {...register('description')}
          rows={3}
        />

        <div className="flex items-center">
          <input
            id="is_private"
            type="checkbox"
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            {...register('is_private')}
          />
          <label htmlFor="is_private" className="ml-2 block text-sm text-gray-900">
            Make this board private
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            className="bg-gray-200 hover:bg-gray-300"
            aria-label="Cancel creating board"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white"
            disabled={isLoading}
            aria-label="Create new board"
          >
            {isLoading ? 'Creating...' : 'Create Board'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
