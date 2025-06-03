
import api from './api';
// Helper untuk dapatkan token dan buat headers Authorization
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createPin = async (formData) => {
  try {
    // Debug FormData before sending
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await api.post('/pins', formData, {
      // Headers are now automatically handled by the interceptor
    });

    return response.data;
  } catch (error) {
    console.error('Error creating pin:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    
    throw new Error(
      error.response?.data?.error || 
      error.response?.data?.message || 
      'Failed to create pin'
    );
  }
};

// Get pins with pagination, search, filtering by category
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

// Search pins by query string
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

// Get a single pin by ID
export const getPinById = async (id) => {
  try {
    const response = await api.get(`/pins/${id}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch pin with ID ${id}:`, error.response?.data || error.message)
    throw new Error('Failed to load pin details, please try again later.')
  }
};
// Like a pin
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

// Unlike a pin
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

// Get popular pins (limit)
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

// Get pins created by a user with pagination
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
