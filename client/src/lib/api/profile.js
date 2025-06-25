import api from '../../services/api'; //
import { handleApiError } from '../errorHandler'; //
import API from '../../services/api';

export const getUserProfile = async (userId) => { //
  try {
    const response = await api.get(`/users/${userId}`); //
    return response.data; //
  } catch (error) {
    throw handleApiError(error); //
  }
};

export const toggleFollow = async (userId) => {
  try {
    const { data } = await API.put(`/users/${userId}/toggle-follow`);
    return data;
  } catch (error) {
    console.error('Gagal follow/unfollow pengguna:', error);
    throw error;
  }
};

export const getUserPins = async (userId) => { //
  try {
    const response = await api.get(`/users/${userId}/pins`); //
    return response.data; //
  } catch (error) {
    throw handleApiError(error); //
  }
};

export const getUserBoards = async (userId) => { //
  try {
    const response = await api.get(`/users/${userId}/boards`); //
    return response.data; //
  } catch (error) {
    throw handleApiError(error); //
  }
};

export const getUserActivity = async (userId) => { //
  try {
    const response = await api.get(`/users/${userId}/activity`); //
    return response.data; //
  } catch (error) {
    throw handleApiError(error); //
  }
};