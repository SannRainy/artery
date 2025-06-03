import api from './api';

// Helper untuk mendapatkan headers Authorization dengan token dari localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Create a new pin with formData (includes file upload)
 * @param {FormData} formData - Data form, termasuk file gambar
 * @returns {Promise<Object>} - Data pin baru dari API
 */
export const createPin = async (formData) => {
  try {
    // Debug isi formData di console sebelum dikirim (optional)
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // POST request ke endpoint /pins, header Authorization otomatis dari interceptor api.js
    const response = await api.post('/pins', formData);

    return response.data;
  } catch (error) {
    // Logging lengkap error untuk debugging
    console.error('Full error object from API call:', error);
    console.error('Error creating pin:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });

    // Buat error dengan pesan yang lebih informatif jika tersedia
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Failed to create pin'
    );
  }
};

/**
 * Get pins dengan pagination dan filter kategori opsional
 * @param {number} page - Halaman data
 * @param {number} limit - Jumlah data per halaman
 * @param {string} category - Filter kategori (optional)
 * @returns {Promise<Object>} - Data pins dari API
 */
export const getPins = async (page = 1, limit = 30, category = '') => {
  try {
    const params = { page, limit };
    if (category) params.category = category;

    const response = await api.get('/pins', {
      headers: getAuthHeaders(),
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pins:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Search pins berdasarkan query string dengan pagination
 * @param {string} query - Kata kunci pencarian
 * @param {number} page - Halaman data
 * @param {number} limit - Jumlah data per halaman
 * @returns {Promise<Object>} - Data hasil pencarian dari API
 */
export const searchPins = async (query, page = 1, limit = 30) => {
  try {
    const response = await api.get('/pins/search', {
      headers: getAuthHeaders(),
      params: { query, page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching pins:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get detail satu pin berdasarkan ID
 * @param {string|number} id - ID pin
 * @returns {Promise<Object>} - Data pin
 */
export const getPinById = async (id) => {
  try {
    const response = await api.get(`/pins/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch pin with ID ${id}:`, error.response?.data || error.message);
    throw new Error('Failed to load pin details, please try again later.');
  }
};

/**
 * Like a pin
 * @param {string|number} pinId - ID pin yang akan di-like
 * @returns {Promise<Object>} - Response API
 */
export const likePin = async (pinId) => {
  try {
    const response = await api.post(`/pins/${pinId}/like`, null, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to like pin with ID ${pinId}:`, error.response?.data || error.message);
    throw new Error('Failed to like pin, please try again later.');
  }
};

/**
 * Unlike a pin
 * @param {string|number} pinId - ID pin yang akan di-unlike
 * @returns {Promise<Object>} - Response API
 */
export const unlikePin = async (pinId) => {
  try {
    const response = await api.delete(`/pins/${pinId}/like`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to unlike pin with ID ${pinId}:`, error.response?.data || error.message);
    throw new Error('Failed to unlike pin, please try again later.');
  }
};

/**
 * Get pins populer, dibatasi jumlah data
 * @param {number} limit - Batas jumlah pin populer yang diambil
 * @returns {Promise<Object>} - Data pins populer
 */
export const getPopularPins = async (limit = 10) => {
  try {
    const response = await api.get('/pins/popular', {
      headers: getAuthHeaders(),
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular pins:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get pins yang dibuat oleh user tertentu dengan pagination
 * @param {string|number} userId - ID user
 * @param {number} page - Halaman data
 * @param {number} limit - Jumlah data per halaman
 * @returns {Promise<Object>} - Data pins user
 */
export const getUserPins = async (userId, page = 1, limit = 30) => {
  try {
    const response = await api.get(`/users/${userId}/pins`, {
      headers: getAuthHeaders(),
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user pins:', error.response?.data || error.message);
    throw error;
  }
};
