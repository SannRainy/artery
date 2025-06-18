// client/src/services/notifications.js
import api from './api';

export const getNotifications = async () => {
  const { data } = await api.get('/notifications');
  return data;
};

export const markNotificationsAsRead = async () => {
  const { data } = await api.post('/notifications/mark-as-read');
  return data;
};