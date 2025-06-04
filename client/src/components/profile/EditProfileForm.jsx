// client/src/components/profile/EditProfileForm.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function EditProfileForm({ currentUser, onProfileUpdated }) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      username: currentUser?.username || '',
      email: currentUser?.email || '',
      bio: currentUser?.bio || '',
      avatar_url: currentUser?.avatar_url || '', // Ini adalah field form, bukan untuk display langsung
    }
  });

  const [loading, setLoading] = useState(false);
  // avatarPreview akan digunakan untuk preview langsung dari file input atau fallback awal
  const [avatarPreview, setAvatarPreview] = useState(''); 
  const [newAvatarFile, setNewAvatarFile] = useState(null);

  const currentFormAvatarUrl = watch('avatar_url'); // Mengamati field form 'avatar_url'

  useEffect(() => {
    if (currentUser) {
      reset({
        username: currentUser.username,
        email: currentUser.email,
        bio: currentUser.bio,
        avatar_url: currentUser.avatar_url, // Set field form 'avatar_url' dari currentUser
      });
      // Atur avatarPreview berdasarkan currentUser.avatar_url saat komponen pertama kali dimuat atau currentUser berubah
      // Ini akan menjadi URL yang valid atau path ke default lokal
      if (currentUser.avatar_url?.startsWith('/uploads/')) {
        setAvatarPreview(`${BASE_URL}${currentUser.avatar_url}`);
      } else if (currentUser.avatar_url?.startsWith('/img/')) { // Jika default dari DB adalah path lokal
        setAvatarPreview(currentUser.avatar_url);
      } else if (currentUser.avatar_url) { // URL eksternal lain atau default yang tersimpan
        setAvatarPreview(currentUser.avatar_url);
      } else {
        setAvatarPreview('/img/default-avatar.png'); // Fallback absolut
      }
    } else {
        setAvatarPreview('/img/default-avatar.png'); // Fallback jika tidak ada currentUser
    }
  }, [currentUser, reset]);


  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result); // Preview dari file yang baru dipilih (data URL)
      };
      reader.readAsDataURL(file);
      setValue('avatar_file_input', file, { shouldDirty: true }); // Anda bisa mendaftarkan input file ini jika perlu validasi
    }
  };

  const onSubmit = async (data) => {
    // Cek apakah username atau bio diubah, atau ada file avatar baru
    const usernameChanged = currentUser.username !== data.username.trim() && data.username.trim() !== '';
    const bioChanged = currentUser.bio !== (data.bio || '');
    
    if (!usernameChanged && !bioChanged && !newAvatarFile) {
        toast.info("Tidak ada perubahan untuk disimpan.");
        return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      if (usernameChanged) {
        formData.append('username', data.username.trim());
      }
      if (bioChanged) {
        formData.append('bio', data.bio || '');
      }
      
      if (newAvatarFile) {
        formData.append('avatar', newAvatarFile);
      }

      const response = await api.put(`/users/${currentUser.id}`, formData);

      toast.success('Profil berhasil diperbarui!');
      if (onProfileUpdated && typeof onProfileUpdated === 'function') {
        onProfileUpdated(response.data); // Panggil callback untuk merefresh data user di AuthContext
      }
      setNewAvatarFile(null); 
      // `reset` di sini akan mengisi ulang form dengan data dari server, termasuk avatar_url baru
      // `useEffect` di atas juga akan menangani update `avatarPreview` berdasarkan `currentUser` baru dari context
      reset({ 
        ...response.data, 
        avatar_url: response.data.avatar_url // Pastikan field avatar_url juga di-reset
      }); 
      
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  // Logika untuk menentukan URL gambar yang akan ditampilkan oleh <Image>
  // currentFormAvatarUrl adalah nilai dari field 'avatar_url' di form, yang diupdate dari currentUser
  let imageSrcForDisplay = '/img/default-avatar.png'; // Default absolut
  if (newAvatarFile) {
    imageSrcForDisplay = avatarPreview; // Jika ada file baru dipilih, gunakan preview base64 nya
  } else if (currentFormAvatarUrl) { // Jika tidak ada file baru, gunakan nilai dari field form (yang diset dari currentUser)
    if (currentFormAvatarUrl.startsWith('/uploads/')) {
      imageSrcForDisplay = `${BASE_URL}${currentFormAvatarUrl}`;
    } else { // Bisa jadi path lokal seperti '/img/default-avatar.png' atau URL eksternal lain
      imageSrcForDisplay = currentFormAvatarUrl;
    }
  }
  // Jika currentFormAvatarUrl kosong dan tidak ada newAvatarFile, akan tetap '/img/default-avatar.png'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow">
          <Image
            // PERUBAHAN: Gunakan imageSrcForDisplay
            src={imageSrcForDisplay}
            alt="Avatar Preview"
            layout="fill"
            objectFit="cover"
            key={imageSrcForDisplay} // Key penting untuk re-render saat src berubah
          />
        </div>
        <div>
          <label htmlFor="avatar-upload" className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md text-sm">
            Ganti Foto Profil
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/png, image/jpeg, image/gif, image/webp"
            className="hidden"
            onChange={handleAvatarChange}
            // Tidak perlu {...register('avatar_file')} di sini jika Anda menangani file secara terpisah
            // kecuali jika Anda ingin validasi react-hook-form pada file nya langsung.
          />
        </div>
         {/* Jika Anda mendaftarkan 'avatar_file_input', errornya bisa ditampilkan */}
         {errors.avatar_file_input && <p className="text-red-500 text-xs mt-1">{errors.avatar_file_input.message}</p>}
      </div>

      <Input
        label="Username"
        id="username"
        {...register('username', { 
            required: 'Username wajib diisi',
            minLength: { value: 3, message: 'Username minimal 3 karakter' },
            maxLength: { value: 50, message: 'Username maksimal 50 karakter' },
         })}
        error={errors.username}
        className="mt-1 block w-full"
      />

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')} // Email di-register tapi dibuat disabled
          disabled
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed"
        />
         <p className="mt-1 text-xs text-gray-500">Email tidak dapat diubah.</p>
      </div>

      <Textarea
        label="Bio"
        id="bio"
        {...register('bio', { maxLength: { value: 500, message: 'Bio maksimal 500 karakter' }})}
        rows={4}
        error={errors.bio}
        placeholder="Ceritakan tentang dirimu..."
        className="mt-1 block w-full"
      />

      <div className="pt-4">
        <Button type="submit" disabled={loading || (!isDirty && !newAvatarFile)} className="w-full md:w-auto">
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  );
}