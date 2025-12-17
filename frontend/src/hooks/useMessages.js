import { useState, useEffect, useCallback, useRef } from 'react';
import * as MessageService from '../services/message.service';
import { useSocket } from '../context/SocketContext';

export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { socket } = useSocket();

  const fetchConversations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await MessageService.getConversations(page);
      setConversations(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ conversationId, message }) => {
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: message,
              unreadCount: (conv.unreadCount || 0) + 1,
              updatedAt: message.createdAt
            };
          }
          return conv;
        });
        
        // Sort by updatedAt
        return updated.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket]);

  return { conversations, loading, error, pagination, refetch: fetchConversations };
};

export const useConversationMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [sending, setSending] = useState(false);
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async (page = 1) => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const response = await MessageService.getMessages(conversationId, page);
      setMessages(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      
      // Join conversation room
      if (socket) {
        socket.emit('joinConversation', conversationId);
      }

      return () => {
        if (socket) {
          socket.emit('leaveConversation', conversationId);
        }
      };
    }
  }, [conversationId, fetchMessages, socket]);

  // Listen for new messages in this conversation
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = ({ conversationId: msgConvId, message }) => {
      if (msgConvId === conversationId) {
        setMessages(prev => [...prev, message]);
        
        // Mark as read
        MessageService.markAsRead(conversationId).catch(console.error);
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, conversationId]);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || !conversationId) return;

    try {
      setSending(true);
      const response = await MessageService.sendMessage(conversationId, content);
      setMessages(prev => [...prev, response.data]);
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      return response.data;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  }, [conversationId]);

  const sendTypingIndicator = useCallback((isTyping) => {
    if (socket && conversationId) {
      socket.emit('typing', { conversationId, isTyping });
    }
  }, [socket, conversationId]);

  return {
    messages,
    loading,
    error,
    pagination,
    sending,
    sendMessage,
    sendTypingIndicator,
    messagesEndRef,
    refetch: fetchMessages
  };
};
