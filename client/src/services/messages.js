// client/src/services/messages.js
import api from './api';

export const getConversations = async () => {
  const { data } = await api.get('/messages');
  return data;
};

export const getMessages = async (conversationId) => {
  const { data } = await api.get(`/messages/${conversationId}`);
  return data;
};

export const sendMessage = async (conversationId, text) => {
  const { data } = await api.post(`/messages/${conversationId}`, { text });
  return data;
};

export const initiateConversation = async (recipientId) => {
  const { data } = await api.post('/messages/initiate', { recipientId });
  return data;
};