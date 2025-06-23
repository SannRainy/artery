// client/src/components/settings/Preferences.jsx
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../ui/Button';
import { useState, useEffect } from 'react';

export default function Preferences({ currentUser }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      profile_default_tab: 'pins'
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      reset({
        profile_default_tab: currentUser.profile_default_tab || 'pins'
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put(`/users/${currentUser.id}`, {
        profile_default_tab: data.profile_default_tab
      });
      toast.success('Preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
      <p className="text-sm text-gray-500 mt-1 mb-8">Customize your experience.</p>
      
      <div className="border-t border-gray-200 pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Profile Page</h3>
            <p className="text-sm text-gray-500 mt-1">Choose which tab appears by default on your profile.</p>
            <fieldset className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    {...register('profile_default_tab')}
                    id="tab-pins"
                    type="radio"
                    value="pins"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="tab-pins" className="ml-3 block text-sm font-medium text-gray-700">
                    Pins
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    {...register('profile_default_tab')}
                    id="tab-activity"
                    type="radio"
                    value="activity"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="tab-activity" className="ml-3 block text-sm font-medium text-gray-700">
                    Activity
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}