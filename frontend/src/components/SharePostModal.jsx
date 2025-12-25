import React, { useState, useEffect } from 'react';
import { X, Search, Check, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as MessageService from '../services/message.service';
import { getImageUrl } from '../utils/imageUtils';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext'; // Assuming needed for current user ID to filter participants
import UserAvatar from './UserAvatar';
import './css/SharePostModal.css';

const SharePostModal = ({ post, onClose }) => {
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sendingTo, setSendingTo] = useState(null); // ID of conversation being sent to

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await MessageService.getConversations();
                setConversations(response.data || []);
            } catch (error) {
                console.error('Failed to load conversations', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p.userId !== currentUser?.id)?.user;
    };

    const filteredConversations = conversations.filter(conv => {
        const otherUser = getOtherParticipant(conv);
        if (!otherUser) return false;
        const name = otherUser.full_name || '';
        const username = otherUser.username || '';
        const query = searchTerm.toLowerCase();
        return name.toLowerCase().includes(query) || username.toLowerCase().includes(query);
    });

    const handleSend = async (conversation) => {
        if (sendingTo) return;
        setSendingTo(conversation.id);

        try {
            const postUrl = `${window.location.origin}/posts/${post.id}`;
            // You might want to format this message better or just send the link
            const content = `${t('post.share_message', 'Check out this post:')}\n${postUrl}`;

            await MessageService.sendMessage(conversation.id, content);

            // Optional: Show success state briefly or close immediately
            setTimeout(() => {
                onClose();
            }, 500);
        } catch (error) {
            console.error('Failed to share post', error);
            setSendingTo(null);
        }
    };

    return (
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="share-modal-content" onClick={e => e.stopPropagation()}>
                <div className="share-modal-header">
                    <h3>{t('post.share_title', 'Send via Direct Message')}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="share-search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t('post.share_search', 'Search people...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="share-list">
                    {loading ? (
                        <div className="share-loading">{t('common.loading', 'Loading...')}</div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="share-empty">{t('post.share_no_results', 'No people found')}</div>
                    ) : (
                        filteredConversations.map(conversation => {
                            const otherUser = getOtherParticipant(conversation);
                            const isSent = sendingTo === conversation.id;

                            return (
                                <button
                                    key={conversation.id}
                                    className="share-item"
                                    onClick={() => handleSend(conversation)}
                                    disabled={!!sendingTo}
                                >
                                    <div className="share-user-info">
                                        <UserAvatar
                                            user={otherUser}
                                            size={40}
                                            className="share-avatar"
                                        />
                                        <div className="share-user-details">
                                            <span className="share-name">{otherUser?.full_name}</span>
                                            <span className="share-handle">@{otherUser?.username}</span>
                                        </div>
                                    </div>

                                    <div className={`share-action ${isSent ? 'sent' : ''}`}>
                                        {isSent ? <Check size={20} /> : <Send size={20} />}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default SharePostModal;
