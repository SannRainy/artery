// client/src/services/pins.js
import api from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); 

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const toggleFollowUser = async (userId) => {
  try {
    const response = await api.post(`/users/${userId}/follow`, null, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createPin = async (formData) => {
  try {

    const response = await api.post('/pins', formData); 
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

export const getPins = async ({page = 1, limit = 30, category = '', userId = null, mode =''}) => {
  try {
    const params = { page, limit };
    if (category && category.trim() !== '' && category !== 'Semua') {
      params.category = category;
    }
    if (mode) {
      params.mode = mode;
    }

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

export const getPinById = async (id) => {
  try {

    const response = await api.get(`/pins/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch pin with ID ${id}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to load pin details.');
  }
};

export const toggleLikePin = async (pinId) => {
  try {

    const response = await api.post(`/pins/${pinId}/like`, null, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to toggle like for pin ${pinId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to update like status.');
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

export const getPopularTags = async () => {
  try {
    const response = await api.get('/tags/popular'); 
    return response.data;
  } catch (error) {
    console.error('Error fetching popular tags:', error.response?.data || error.message);
    throw error;
  }
};

export const getRandomPinTitles = async () => {
  try {
    const response = await api.get('/pins/random-titles');
    return response.data;
  } catch (error) {
    console.error('Error fetching random pin titles:', error.response?.data || error.message);
    throw error;
  }
};