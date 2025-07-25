import api from '../../services/api';
import { handleApiError } from '../errorHandler';
import { getAuthHeaders } from '../../services/auth';

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/users/${userId}`, profileData, {
      headers: {
        ...getAuthHeaders(), // Menambahkan header otentikasi
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const toggleFollowUser = async (userId) => {
  try {
    const response = await api.post(`/users/${userId}/follow`, null, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    // Menggunakan nama fungsi error yang benar
    throw handleApiError(error);
  }
};

export const getUserPins = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/pins`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getUserBoards = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/boards`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getUserActivity = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/activity`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
