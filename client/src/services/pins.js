// client/src/services/pins.js
import api from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Di AuthContexts, Anda menggunakan Cookies.get('token')
                                            // Pastikan konsisten atau gunakan metode yang sesuai.
                                            // Untuk client-side API calls, localStorage umumnya OK.
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const followUser = (userId) => {
  return api.post(`/users/${userId}/follow`);
}

export const createPin = async (formData) => {
  try {

    const response = await api.post('/pins', formData); // Headers FormData dihandle oleh interceptor
    return response.data;
  } catch (error) {
    console.error('Error creating pin:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    throw new Error(
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'Failed to create pin'
    );
  }
};

export const getPins = async (page = 1, limit = 30, category = '', userId = null) => {
  try {
    const params = { page, limit };
    if (category && category.trim() !== '' && category !== 'Semua') {
      params.category = category;
    }
    if (userId) {
      params.user_id = userId;
    }

    // Jika untuk halaman publik, getAuthHeaders() mungkin tidak mengirim token,
    // dan server route GET /pins harusnya tidak memerlukan autentikasi.
    const response = await api.get('/pins', {
      headers: getAuthHeaders(), // Kirim token jika ada, server akan menentukan is_liked
      params,
    });
    return response.data; // Diharapkan berisi { data: [pins...], pagination: {...} }
  } catch (error) {
    console.error('Error fetching pins:', error.response?.data || error.message);
    throw error;
  }
};

export const searchPins = async (query, page = 1, limit = 30) => {
  try {
    const response = await api.get('/pins/search', {
      headers: getAuthHeaders(), // Kirim token jika ada, server bisa mengembalikan is_liked
      params: { query, page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching pins:', error.response?.data || error.message);
    throw error;
  }
};

export const getPinById = async (id) => {
  try {
    // Mengirim header auth agar server bisa menentukan `is_liked` untuk user saat ini
    const response = await api.get(`/pins/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch pin with ID ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to load pin details.');
  }
};

export const likePin = async (pinId) => {
  try {
    const response = await api.post(`/pins/${pinId}/like`, null, {
      headers: getAuthHeaders(),
    });
    // Server sekarang diharapkan mengembalikan { liked: true, new_like_count: N }
    return response.data;
  } catch (error) {
    console.error(`Failed to like pin with ID ${pinId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to like pin.');
  }
};

export const unlikePin = async (pinId) => {
  try {

    const response = await api.post(`/pins/${pinId}/like`, null, { // Sama seperti likePin
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error(`Failed to unlike pin with ID ${pinId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to unlike pin.');
  }
};

export const addComment = async (pinId, text) => {
  try {
    const response = await api.post(`/pins/${pinId}/comments`,
      { text },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to add comment to pin ${pinId}:`, error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'Failed to add comment, please try again later.'
    );
  }
};

// Fungsi populer bisa tetap sama, server akan menentukan data yang dikembalikan
export const getPopularPins = async (limit = 10) => {
  try {
    const response = await api.get('/pins/popular', { // Pastikan endpoint ini ada di server
      headers: getAuthHeaders(), // Server bisa gunakan ini untuk `is_liked`
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular pins:', error.response?.data || error.message);
    throw error;
  }
};

// Fungsi getUserPins (dari profile.js) juga bisa ada di sini jika lebih logis
// export const getUserPins = async (userId, page = 1, limit = 30) => { ... };