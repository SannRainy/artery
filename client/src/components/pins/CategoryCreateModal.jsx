// components/pins/CategoryCreateModal.jsx
import { useState } from 'react';
import Modal from '../ui/Modal'; // Asumsikan Anda sudah memiliki komponen Modal
import Button from '../ui/Button';
import Input from '../ui/Input'; // Asumsikan Anda sudah memiliki komponen Input

export default function CategoryCreateModal({ isOpen, onClose, onCreateCategory }) {
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onCreateCategory(categoryName);
      setCategoryName('');
    } catch (err) {
      setError('Failed to create category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Create New Category</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              autoFocus
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}