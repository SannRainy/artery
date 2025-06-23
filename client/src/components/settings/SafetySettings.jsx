// client/src/components/settings/SafetySettings.jsx
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useState } from 'react';

export default function SafetySettings() {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password berhasil diubah!');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Gagal mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Safety & Security</h2>
      <p className="text-sm text-gray-500 mt-1 mb-8">Manage your account's security.</p>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 max-w-lg">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
            <Input
              id="currentPassword"
              type="password"
              {...register('currentPassword', { required: 'Current password is required.' })}
              error={errors.currentPassword}
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword', { 
                required: 'New password is required.',
                minLength: { value: 6, message: 'Password must be at least 6 characters.' }
              })}
              error={errors.newPassword}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your new password.',
                validate: value => value === newPassword || 'The passwords do not match.'
              })}
              error={errors.confirmPassword}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}