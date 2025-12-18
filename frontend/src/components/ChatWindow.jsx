import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Send, Loader, Image as ImageIcon, Check, CheckCheck, X, Download, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr, es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useConversationMessages } from '../hooks/useMessages';
import { useSocket } from '../context/SocketContext';
import { getImageUrl } from '../utils/imageUtils';
import SharePostModal from './SharePostModal'; // Import new modal
import PostPreviewBubble from './PostPreviewBubble'; // Import preview bubble
import './css/ChatWindow.css';
import './css/ImagePreview.css';

const getPostIdFromContent = (content) => {
  if (!content) return null;
  const match = content.match(/\/posts\/(\d+)/);
  return match ? match[1] : null;
};

const ChatWindow = ({ conversation, currentUserId }) => {
  const { t, i18n } = useTranslation();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
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

    // Listen for read receipts
    const handleMessagesRead = ({ conversationId: readConvId, readByUserId }) => {
      if (readConvId === conversation.id && readByUserId !== currentUserId) {
        // Force update or let useMessages handle it?
        // useMessages handles 'newMessage' but not 'messagesRead' yet?
        // Actually useMessages doesn't export a way to update messages state from outside except refetch.
        // However, we can listen here and locally update messages if we want, OR update useMessages to listen to it.
        // Let's update useMessages to listen to it.
        // Wait, easier to just accept the event here and maybe refetch or hack it for now if simple.
        // Better: Update useConversationMessages in useMessages.js to listen to 'messagesRead'.
        // But for now, let's just leave it, I will update useMessages.js in next step to handle 'messagesRead'.
      }
    };

    return () => {
      socket.off('userTyping', handleUserTyping);
    };
  }, [socket, conversation, currentUserId]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('messages.images_only', 'Images only'));
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    // Check if there is text as well? Logic usually allows one or other or both.
    // If text exists, append it.
    if (messageText.trim()) {
      formData.append('content', messageText.trim());
    }

    try {
      await sendMessage(formData);
      setMessageText('');
      setIsTyping(false);
      sendTypingIndicator(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to send image:', error);
    }
  };

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

  // Helper to render modal via portal
  const renderImageModal = () => {
    if (!previewImage) return null;

    return createPortal(
      <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
        <div className="image-preview-content" onClick={e => e.stopPropagation()}>
          <button className="image-preview-close" onClick={() => setPreviewImage(null)}>
            <X size={24} />
          </button>
          <img src={previewImage} alt="Preview" className="image-preview-img" />
          <div className="image-preview-actions">
            <a href={previewImage} download="image.png" target="_blank" rel="noopener noreferrer" className="preview-action-btn">
              <Download size={18} /> {t('common.download', 'Download')}
            </a>
            <a href={previewImage} target="_blank" rel="noopener noreferrer" className="preview-action-btn">
              <ExternalLink size={18} /> {t('common.open', 'Open')}
            </a>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-user">
          <img
            src={getImageUrl(otherUser?.avatar) || '/default-avatar.svg'}
            alt={otherUser?.full_name}
            className="chat-header-avatar"
            onError={(e) => {
              e.target.src = '/default-avatar.svg';
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
                  src={getImageUrl(message.sender.avatar) || '/default-avatar.svg'}
                  alt={message.sender.full_name}
                  className="message-avatar"
                  onError={(e) => {
                    e.target.src = '/default-avatar.svg';
                  }}
                />
              )}
              <div className="message-content">
                <div className={`message-bubble ${message.mediaUrl ? 'has-media' : ''}`}>
                  {message.mediaUrl && (
                    <img
                      src={getImageUrl(message.mediaUrl)}
                      alt="Shared"
                      className="message-image"
                      onClick={() => setPreviewImage(getImageUrl(message.mediaUrl))}
                    />
                  )}
                  {(() => {
                    const postId = getPostIdFromContent(message.content);
                    // Check if content matches the default share template roughly
                    const isShareMessage = message.content?.toLowerCase().includes('check out this post') && postId;

                    if (isShareMessage) {
                      return <PostPreviewBubble postId={postId} fallbackContent={message.content} />;
                    }

                    return (
                      <>
                        {message.content && <p>{message.content}</p>}
                        {postId && <PostPreviewBubble postId={postId} fallbackContent={null} />}
                      </>
                    );
                  })()}
                </div>
                <div className="message-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <span className="message-time">
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: getLocale()
                    })}
                  </span>
                  {isOwn && (
                    message.read || (message.readAt) ? (
                      <CheckCheck size={14} color="#3b82f6" />
                    ) : (
                      <Check size={14} />
                    )
                  )}
                </div>
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
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*"
        />
        <button
          type="button"
          className="icon-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          style={{ marginRight: '8px', color: 'var(--text-secondary)' }}
        >
          <ImageIcon size={20} />
        </button>
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

      {renderImageModal()}
    </div>
  );
};

export default ChatWindow;
