import api from './api';

/**
 * Get all conversations for current user
 */
export const getConversations = (page = 1, limit = 20) => {
  return api.get('/messages/conversations', { params: { page, limit } });
};

/**
 * Create or get conversation with a user
 */
export const createConversation = (recipientId) => {
  return api.post('/messages/conversations', { recipientId });
};

/**
 * Get conversation by ID
 */
export const getConversation = (conversationId) => {
  return api.get(`/messages/conversations/${conversationId}`);
};

/**
 * Get messages in a conversation
 */
export const getMessages = (conversationId, page = 1, limit = 50) => {
  return api.get(`/messages/conversations/${conversationId}/messages`, {
    params: { page, limit }
  });
};

/**
 * Send message in a conversation
 */
export const sendMessage = (conversationId, content) => {
  return api.post(`/messages/conversations/${conversationId}/messages`, { content });
};

/**
 * Mark conversation as read
 */
export const markAsRead = (conversationId) => {
  return api.patch(`/messages/conversations/${conversationId}/read`);
};
