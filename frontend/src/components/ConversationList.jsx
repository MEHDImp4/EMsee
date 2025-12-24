import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr, es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import UserAvatar from './UserAvatar';
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
      {conversations.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1rem',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t('messages.empty', 'Aucune conversation')}</p>
          <p style={{ fontSize: '0.9rem' }}>{t('messages.start_hint', 'Appuyez sur + pour commencer une conversation')}</p>
        </div>
      ) : (
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
                <UserAvatar
                  user={otherUser}
                  size={50}
                  className="conversation-avatar-img"
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
                      {(() => {
                        const content = conversation.lastMessage.content;

                        // If content exists, display it (or special 'Shared Post' text)
                        if (content) {
                          // Check if it's a shared post
                          if (content.match(/\/posts\/\d+/) && (content.includes('http') || content.toLowerCase().includes('check out'))) {
                            return (
                              <span style={{ fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                🔗 {t('messages.shared_post', 'A partagé un post')}
                              </span>
                            );
                          }

                          // Normal text
                          return (
                            <>
                              {content.substring(0, 50)}
                              {content.length > 50 && '...'}
                            </>
                          );
                        }

                        // Fallback for media-only messages
                        return (
                          <span style={{ fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            📷 {t('messages.sent_image', 'Image')}
                          </span>
                        );
                      })()}
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
