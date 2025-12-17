import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr, es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useConversationMessages } from '../hooks/useMessages';
import { useSocket } from '../context/SocketContext';
import '../components/css/ChatWindow.css';

const ChatWindow = ({ conversation, currentUserId }) => {
  const { t, i18n } = useTranslation();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { socket } = useSocket();

  const {
    messages,
    loading,
    sending,
    sendMessage,
    sendTypingIndicator,
    messagesEndRef
  } = useConversationMessages(conversation?.id);

  const getLocale = () => {
    switch (i18n.language) {
      case 'fr': return fr;
      case 'es': return es;
      default: return undefined;
    }
  };

  const otherUser = conversation?.participants.find(p => p.userId !== currentUserId)?.user;

  useEffect(() => {
    if (!socket || !conversation) return;

    const handleUserTyping = ({ userId, isTyping }) => {
      if (userId !== currentUserId) {
        setOtherUserTyping(isTyping);
      }
    };

    socket.on('userTyping', handleUserTyping);

    return () => {
      socket.off('userTyping', handleUserTyping);
    };
  }, [socket, conversation, currentUserId]);

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || sending) return;

    try {
      await sendMessage(messageText.trim());
      setMessageText('');
      setIsTyping(false);
      sendTypingIndicator(false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="chat-window-loading">
        <Loader className="spinner" size={32} />
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-user">
          <img
            src={otherUser?.avatar || '/default-avatar.png'}
            alt={otherUser?.full_name}
            className="chat-header-avatar"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
          <div>
            <h3>{otherUser?.full_name}</h3>
            <p className="username">@{otherUser?.username}</p>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`message ${isOwn ? 'message-own' : 'message-other'}`}
            >
              {!isOwn && (
                <img
                  src={message.sender.avatar || '/default-avatar.png'}
                  alt={message.sender.full_name}
                  className="message-avatar"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              )}
              <div className="message-content">
                <div className="message-bubble">
                  {message.content}
                </div>
                <span className="message-time">
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                    locale: getLocale()
                  })}
                </span>
              </div>
            </div>
          );
        })}
        
        {otherUserTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <textarea
          value={messageText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={t('messages.type_message', 'Tapez votre message...')}
          className="chat-input"
          rows={1}
          disabled={sending}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={!messageText.trim() || sending}
        >
          {sending ? <Loader className="spinner" size={20} /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
