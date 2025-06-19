// client/src/components/profile/EditProfileForm.jsx
import { useState, useEffect, useCallback } from 'react';
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
      if (file.size > 2 * 1024 * 1024) {
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
    const usernameChanged = currentUser.username !== data.username.trim();
    const bioChanged = (currentUser.bio || '') !== (data.bio || '');
    
    if (!usernameChanged && !bioChanged && !newAvatarFile) {
      toast.info("Tidak ada perubahan untuk disimpan.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (usernameChanged) formData.append('username', data.username.trim());
      if (bioChanged) formData.append('bio', data.bio || '');
      if (newAvatarFile) formData.append('avatar', newAvatarFile);

      const response = await api.put(`/users/${currentUser.id}`, formData);

      toast.success('Profil berhasil diperbarui!');
      if (onProfileUpdated) onProfileUpdated(response.data.user);
      router.push(`/users/${currentUser.id}`);
      
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Bagian Judul Form */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Profil Publik</h2>
        <p className="text-sm text-gray-500 mt-1">Informasi ini akan ditampilkan secara publik di halaman profil Anda.</p>
      </div>

      {/* Bagian Foto Profil */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
          <Image src={avatarPreview} alt="Avatar Preview" layout="fill" objectFit="cover" key={avatarPreview} />
        </div>
        <div>
          <label htmlFor="avatar-upload" className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
            Ubah
          </label>
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
          <label htmlFor="username" className="text-sm font-semibold text-gray-700 md:col-span-1">Username</label>
          <div className="md:col-span-2">
            <Input id="username" {...register('username', { required: 'Username wajib diisi' })} error={errors.username} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
          <label htmlFor="bio" className="text-sm font-semibold text-gray-700 md:col-span-1 pt-2">Bio</label>
          <div className="md:col-span-2">
            <Textarea id="bio" {...register('bio')} rows={4} placeholder="Ceritakan sedikit tentang dirimu..." />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
        <Button type="submit" disabled={loading || (!isDirty && !newAvatarFile)}>
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  );
}