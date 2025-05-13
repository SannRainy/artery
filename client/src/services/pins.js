import api from './api';  // Pastikan api sudah dikonfigurasi dengan benar

export const getPins = async (page = 1, limit = 30) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/pins', {
      headers: {
        Authorization: `Bearer ${token}`  // Pastikan token dikirim di header
      },
      params: { page, limit }
    });
    return response.data;  // Mengembalikan data pins
  } catch (error) {
    console.error('Error fetching pins:', error.response ? error.response.data : error);
    throw error;
  }
};


// Fetch a single pin by ID
export const getPinById = async (id) => {
  try {
    const response = await api.get(`/pins/${id}`);
    
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Failed to fetch pin with ID ${id}`);
    }
  } catch (error) {
    console.error(`Failed to fetch pin with ID ${id}:`, error);
    throw new Error('Failed to load pin details, please try again later.');
  }
};

// Create a new Pin
export const createPin = async (formData) => {
  try {
    const response = await api.post('/pins', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error('Failed to create pin');
    }
  } catch (error) {
    console.error('Failed to create pin:', error);
    throw new Error('Failed to create pin, please try again later.');
  }
};

// Like a Pin
export const likePin = async (pinId) => {
  try {
    const response = await api.post(`/pins/${pinId}/like`);
    
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Failed to like pin with ID ${pinId}`);
    }
  } catch (error) {
    console.error(`Failed to like pin with ID ${pinId}:`, error);
    throw new Error('Failed to like pin, please try again later.');
  }
};

// Unlike a Pin
export const unlikePin = async (pinId) => {
  try {
    const response = await api.delete(`/pins/${pinId}/like`);
    
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Failed to unlike pin with ID ${pinId}`);
    }
  } catch (error) {
    console.error(`Failed to unlike pin with ID ${pinId}:`, error);
    throw new Error('Failed to unlike pin, please try again later.');
  }
};
