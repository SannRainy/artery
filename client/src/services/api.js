import axios from 'axios';
import Cookies from 'js-cookie'; 

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
});


api.interceptors.request.use(
  (config) => {
    
    const token = typeof window !== 'undefined' ? Cookies.get('token') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
      config.transformRequest = (data) => data; 
    }

    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      
      Cookies.remove('token');
    }
    return Promise.reject(error);
  }
);

export default api;
