// client/src/components/pins/PinCreateModal.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createPin } from '../../services/pins';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function PinCreateModal({ isOpen, onClose, onPinCreated }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setErrorMessage(null);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('category', data.category);

      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      } else {
        throw new Error('Gambar pin wajib diunggah.');
      }

      const newPin = await createPin(formData);
      if (onPinCreated && typeof onPinCreated === 'function') {
        onPinCreated(newPin);
      }
      onClose();
    } catch (err) {
      console.error("Error creating pin:", err);

      let message = 'Terjadi kesalahan yang tidak diketahui saat mengunggah pin.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else if (err && typeof err === 'object' && err.response && err.response.data && (err.response.data.message || err.response.data.error?.message)) {
        message = err.response.data.message || err.response.data.error.message;
      } else if (err && typeof err === 'object' && err.error) {
        message = err.error;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Buat Pin Baru</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul</label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'Judul wajib diisi' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              id="description"
              {...register('description')}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
            ></textarea>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
            <select
              id="category"
              {...register('category', { required: 'Kategori wajib diisi' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Pilih Kategori</option>
              <option value="Pixel char">Pixel char</option>
              <option value="Illustration">Illustration</option>
              <option value="Sketsa anime">Sketsa anime</option>
              <option value="Sketsa">Sketsa</option>
              <option value="Ilustrasi karakter">Ilustrasi karakter</option>
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Gambar Pin</label>
            <input
              id="image" 
              type="file"
              accept="image/*"
              {...register('image', { required: 'Gambar wajib diunggah' })} 
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary-dark"
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
          </div>

          {errorMessage && (
            <div className="text-red-600 bg-red-100 p-3 rounded-md text-center">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mengunggah...' : 'Buat Pin'}
          </button>
        </form>
      </div>
    </div>
  );
}