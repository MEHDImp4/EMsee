import React, { useState } from 'react';
import { MessageSquare, Loader, Search, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConversations } from '../hooks/useMessages';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import NewConversationModal from '../components/NewConversationModal';
import '../pages/css/Messages.css';

const Messages = () => {
    const { t } = useTranslation();
    const { conversations, loading, refetch } = useConversations();
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const currentUserId = userData ? JSON.parse(userData)?.id : null;

    const handleConversationCreated = (conversation) => {
        refetch();
        setSelectedConversation(conversation);
    };

    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery.trim()) return true;
        const otherUser = conv.participants.find(p => p.userId !== currentUserId)?.user;
        return otherUser?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <div className="messages-container">
                <div className="messages-inbox-section">
                    <div className="messages-loading">
                        <Loader className="spinner" size={32} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="messages-container">
                {/* Inbox Column */}
                <div className="messages-inbox-section">
                    <div className="inbox-header">
                        <h2>{t('messages.title', 'Messages')}</h2>
                        <button 
                            className="icon-button"
                            onClick={() => setShowNewConversationModal(true)}
                            title="New message"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <div className="inbox-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={t('messages.search_users', 'Search conversations...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="conversations-list-wrapper">
                        {filteredConversations.length === 0 ? (
                            <div className="empty-inbox">
                                <MessageSquare size={48} />
                                <p>{t('messages.no_conversations', 'No conversations yet')}</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setShowNewConversationModal(true)}
                                >
                                    {t('messages.start_conv', 'Start a conversation')}
                                </button>
                            </div>
                        ) : (
                            <ConversationList
                                conversations={filteredConversations}
                                selectedConversation={selectedConversation}
                                onSelectConversation={setSelectedConversation}
                                currentUserId={currentUserId}
                            />
                        )}
                    </div>
                </div>

                {/* Chat Column */}
                <div className="messages-chat-section">
                    {selectedConversation && currentUserId ? (
                        <ChatWindow
                            conversation={selectedConversation}
                            currentUserId={currentUserId}
                        />
                    ) : (
                        <div className="empty-chat">
                            <div className="empty-chat-icon">
                                <MessageSquare size={64} />
                            </div>
                            <h3>{t('messages.welcome_title', 'Welcome to your messages')}</h3>
                            <p>
                                {t('messages.welcome_desc', 'Select a conversation to start messaging')}
                            </p>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => setShowNewConversationModal(true)}
                            >
                                {t('messages.start_conv', 'Start conversation')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showNewConversationModal && (
                <NewConversationModal
                    onClose={() => setShowNewConversationModal(false)}
                    onConversationCreated={handleConversationCreated}
                />
            )}
        </>
    );
};

export default Messages;
