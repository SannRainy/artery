import api from './api';
import Cookies from 'js-cookie';

export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });

    const token = response.data.token;
    if (token) {

      Cookies.set('token', token, { expires: 1 }); // 1 hari
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return response.data;
  } catch (error) {
    handleError(error, 'Login failed');
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/users/register', { username, email, password });
    return response.data;
  } catch (error) {
    handleError(error, 'Registration failed');
  }
};

export const getCurrentUser = async () => {
  try {
    const token = Cookies.get('token');
    if (!token) return null;

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error.response?.data || error.message);
    return null;
  }
};


const handleError = (error, defaultMessage) => {
  if (error.response) {
    const message = error.response.data?.message || error.response.statusText || defaultMessage;
    throw new Error(`${defaultMessage}: ${message}`);
  } else if (error.request) {
    throw new Error('No response from server. Please try again later.');
  } else {
    throw new Error(`Unexpected error: ${error.message}`);
  }
};
