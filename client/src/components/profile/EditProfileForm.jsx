// client/src/components/profile/EditProfileForm.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { useRouter } from 'next/router';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function EditProfileForm({ currentUser, onProfileUpdated }) {
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      username: currentUser?.username || '',
      bio: currentUser?.bio || '',
      // Menambahkan field lain sesuai desain, jika ada di data user
      email: currentUser?.email || '',
      location: currentUser?.location || 'Hamburg, Germany', // Contoh data
      nationality: currentUser?.nationality || 'German', // Contoh data
      date_of_birth: currentUser?.date_of_birth ? new Date(currentUser.date_of_birth).toISOString().split('T')[0] : '1988-10-06', // Contoh data
    }
  });

  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('/img/default-avatar.png');
  const [newAvatarFile, setNewAvatarFile] = useState(null);

  useEffect(() => {
    if (currentUser) {
      reset({
        username: currentUser.username || '',
        bio: currentUser.bio || '',
        email: currentUser.email || '',
      });
      const currentAvatar = currentUser.avatar_url?.startsWith('/uploads/') 
        ? `${BASE_URL}${currentUser.avatar_url}` 
        : (currentUser.avatar_url || '/img/default-avatar.png');
      setAvatarPreview(currentAvatar);
    }
  }, [currentUser, reset]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Batas 2MB
        toast.error("Ukuran file terlalu besar. Maksimal 2MB.");
        return;
      }
      setNewAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    if (!isDirty && !newAvatarFile) {
      toast.info("Tidak ada perubahan untuk disimpan.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    // Hanya tambahkan field yang berubah
    if (data.username !== currentUser.username) formData.append('username', data.username.trim());
    if (data.bio !== (currentUser.bio || '')) formData.append('bio', data.bio || '');
    if (newAvatarFile) formData.append('avatar', newAvatarFile);
    
    // Implementasi untuk field lain jika backend mendukungnya
    // if (data.location !== currentUser.location) formData.append('location', data.location);
    // ... dan seterusnya

    try {
      const response = await api.put(`/users/${currentUser.id}`, formData);
      toast.success('Profil berhasil diperbarui!');
      if (onProfileUpdated) onProfileUpdated(response.data);
      router.push(`/users/${currentUser.id}`);
      
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-2xl font-bold text-gray-900">Personal details</h2>
      <p className="text-sm text-gray-500 mt-1 mb-8">Edit your personal details</p>

      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
          <Image src={avatarPreview} alt="Avatar Preview" layout="fill" objectFit="cover" key={avatarPreview} />
        </div>
        <label htmlFor="avatar-upload" className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-full text-sm transition-colors">
          Change
        </label>
        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      <div className="space-y-6 border-t border-gray-200 pt-6">
        {/* Full Name / Username */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label htmlFor="username" className="text-sm font-semibold text-gray-600 md:col-span-1">Full name</label>
          <div className="md:col-span-3">
            <Input id="username" {...register('username', { required: 'Full name is required' })} error={errors.username} />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label htmlFor="location" className="text-sm font-semibold text-gray-600 md:col-span-1">Location</label>
          <div className="md:col-span-3">
             <Input id="location" {...register('location')} placeholder="e.g., Hamburg, Germany" />
          </div>
        </div>
        
        {/* Email */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label htmlFor="email" className="text-sm font-semibold text-gray-600 md:col-span-1">Email</label>
          <div className="md:col-span-3">
            <Input id="email" type="email" {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
            })} error={errors.email} />
          </div>
        </div>

        {/* Nationality */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label htmlFor="nationality" className="text-sm font-semibold text-gray-600 md:col-span-1">Nationality</label>
            <div className="md:col-span-3">
                <Input id="nationality" {...register('nationality')} placeholder="e.g., German" />
            </div>
        </div>

        {/* Date of birth */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label htmlFor="date_of_birth" className="text-sm font-semibold text-gray-600 md:col-span-1">Date of birth</label>
            <div className="md:col-span-3">
                <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
            </div>
        </div>

         {/* Bio */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <label htmlFor="bio" className="text-sm font-semibold text-gray-600 md:col-span-1 pt-2">Bio</label>
            <div className="md:col-span-3">
                <Textarea id="bio" {...register('bio')} rows={4} placeholder="Tell us a little about yourself..." />
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-8 mt-8 border-t border-gray-200">
        <Button type="submit" disabled={loading || (!isDirty && !newAvatarFile)}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}