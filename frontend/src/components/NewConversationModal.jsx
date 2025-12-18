import React, { useState } from 'react';
import { X, Search, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UserService from '../services/user.service';
import { createConversation } from '../services/message.service';
import { getImageUrl } from '../utils/imageUtils';
import '../components/css/NewConversationModal.css';

const NewConversationModal = ({ onClose, onConversationCreated }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await UserService.searchUsers(query);
      setSearchResults(response || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user) => {
    try {
      setCreating(true);
      const response = await createConversation(user.id);
      onConversationCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content new-conversation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('messages.new_conversation', 'Nouvelle conversation')}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder={t('messages.search_users', 'Rechercher des utilisateurs...')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>
        </div>

        <div className="user-results">
          {loading ? (
            <div className="loading-container">
              <Loader className="spinner" size={24} />
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map(user => (
              <div
                key={user.id}
                className="user-result-item"
                onClick={() => !creating && handleSelectUser(user)}
              >
                <img
                  src={getImageUrl(user.avatar) || '/default-avatar.svg'}
                  alt={user.full_name}
                  className="user-avatar"
                  onError={(e) => {
                    e.target.src = '/default-avatar.svg';
                  }}
                />
                <div className="user-info">
                  <h4>{user.full_name}</h4>
                  <p className="username">@{user.username}</p>
                  {user.bio && <p className="user-bio">{user.bio}</p>}
                </div>
                {creating && <Loader className="spinner" size={20} />}
              </div>
            ))
          ) : searchQuery.trim().length >= 2 ? (
            <div className="no-results">
              <p>{t('messages.no_users_found', 'Aucun utilisateur trouvé')}</p>
            </div>
          ) : (
            <div className="no-results">
              <p>{t('messages.search_prompt', 'Recherchez un utilisateur pour démarrer une conversation')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
