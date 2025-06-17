import api from '../../services/api'; //
import { handleApiError } from '../errorHandler'; //

export const getUserProfile = async (userId) => { //
  try {
    const response = await api.get(`/users/${userId}`); //
    return response.data; //
  } catch (error) {
    throw handleApiError(error); //
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

export const followUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to follow a user.");
  }
  try {
    const { data } = await api.post(`/users/${userId}/follow`);
    return data;
  } catch (error) {
    console.error(`API Error following user ${userId}:`, error.response?.data || error.message);
    throw handleApiError(error);
  }
};