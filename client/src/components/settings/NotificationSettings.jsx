// client/src/components/settings/NotificationSettings.jsx
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../ui/Button';

// Komponen Switch/Toggle
const Toggle = ({ label, description, ...props }) => (
  <div className="flex items-center justify-between">
    <div>
      <label htmlFor={props.id} className="font-medium text-gray-900">{label}</label>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <label htmlFor={props.id} className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" id={props.id} className="sr-only peer" {...props} />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    </label>
  </div>
);

export default function NotificationSettings({ currentUser }) {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      reset({
        notifications_on_follow: currentUser.notifications_on_follow ?? true,
        notifications_on_comment: currentUser.notifications_on_comment ?? true,
        notifications_on_like: currentUser.notifications_on_like ?? true,
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put(`/users/${currentUser.id}`, data);
      toast.success('Notification settings saved!');
    } catch (error) {
      toast.error('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
      <p className="text-sm text-gray-500 mt-1 mb-8">Choose what you want to be notified about.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="divide-y divide-gray-200">
          <div className="py-6">
            <h3 className="text-lg font-semibold text-gray-800">By Push Notification</h3>
            <p className="text-sm text-gray-500 mt-1">Notifications you receive within the app.</p>
            <div className="mt-4 space-y-4">
              <Toggle
                id="notifications_on_follow"
                label="New followers"
                description="When someone starts following you."
                {...register('notifications_on_follow')}
              />
              <Toggle
                id="notifications_on_like"
                label="Likes"
                description="When someone likes one of your pins."
                {...register('notifications_on_like')}
              />
              <Toggle
                id="notifications_on_comment"
                label="Comments"
                description="When someone comments on one of your pins."
                {...register('notifications_on_comment')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}