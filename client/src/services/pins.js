import api from './api';

// Get pins with pagination, search, and filtering
export const getPins = async (page = 1, limit = 30, category = '') => {
  try {
    const token = localStorage.getItem('token');
    const params = { page, limit };
    
    if (category) {
      params.category = category;
    }

    const response = await api.get('/pins', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pins:', error.response?.data || error.message);
    throw error;
  }
};

// Search pins by query
export const searchPins = async (query, page = 1, limit = 30) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/pins/search', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        query,
        page,
        limit
      }
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
    const token = localStorage.getItem('token');
    console.log('Token used:', token);
    const response = await api.get(`/pins/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch pin with ID ${id}:`, error.response?.data || error.message);
    throw new Error('Failed to load pin details, please try again later.');
  }
};


// Create a new pin
export const createPin = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/pins', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to create pin:', error.response?.data || error.message);
    throw new Error('Failed to create pin, please try again later.');
  }
};

// Like a pin
export const likePin = async (pinId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post(`/pins/${pinId}/like`, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
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
    const token = localStorage.getItem('token');
    const response = await api.delete(`/pins/${pinId}/like`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to unlike pin with ID ${pinId}:`, error.response?.data || error.message);
    throw new Error('Failed to unlike pin, please try again later.');
  }
};

// Get popular pins
export const getPopularPins = async (limit = 10) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/pins/popular', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular pins:', error.response?.data || error.message);
    throw error;
  }
};

// Get pins by user
export const getUserPins = async (userId, page = 1, limit = 30) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`/users/${userId}/pins`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user pins:', error.response?.data || error.message);
    throw error;
  }
};