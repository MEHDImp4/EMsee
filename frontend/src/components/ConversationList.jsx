import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr, es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import '../components/css/ConversationList.css';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, currentUserId }) => {
  const { t, i18n } = useTranslation();

  const getLocale = () => {
    switch (i18n.language) {
      case 'fr': return fr;
      case 'es': return es;
      default: return undefined;
    }
  };

  const getOtherParticipant = (conversation, currentUserId) => {
    return conversation.participants.find(p => p.userId !== currentUserId)?.user;
  };

  return (
    <div className="conversation-list">
      {conversations.length === 0 ? null : (
        conversations.map(conversation => {
          const otherUser = getOtherParticipant(conversation, currentUserId);
          const isSelected = selectedConversation?.id === conversation.id;

          return (
            <div
              key={conversation.id}
              className={`conversation-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-avatar">
                <img
                  src={otherUser?.avatar || '/default-avatar.png'}
                  alt={otherUser?.full_name}
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                {conversation.unreadCount > 0 && (
                  <div className="unread-badge">{conversation.unreadCount}</div>
                )}
              </div>
              
              <div className="conversation-info">
                <div className="conversation-header">
                  <h4 className="conversation-name">{otherUser?.full_name}</h4>
                  <span className="conversation-time">
                    {conversation.lastMessage && formatDistanceToNow(
                      new Date(conversation.lastMessage.createdAt),
                      { addSuffix: true, locale: getLocale() }
                    )}
                  </span>
                </div>
                
                <div className="conversation-preview">
                  <span className="username">@{otherUser?.username}</span>
                  {conversation.lastMessage && (
                    <p className="last-message">
                      {conversation.lastMessage.sender.id === currentUserId && 
                        `${t('messages.you', 'Vous')}: `}
                      {conversation.lastMessage.content.substring(0, 50)}
                      {conversation.lastMessage.content.length > 50 && '...'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ConversationList;
