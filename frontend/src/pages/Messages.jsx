import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, MessageSquare } from 'lucide-react';
import { useConversations } from '../hooks/useMessages';
import { useAuth } from '../context/AuthContext';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import NewConversationModal from '../components/NewConversationModal';
import PageLoader from '../components/loaders/PageLoader';
import './css/Messages.css';

const Messages = () => {
    const { t } = useTranslation();
    const {
        conversations,
        loading,
        error,
        refetch
    } = useConversations();
    const { user: currentUser } = useAuth();

    // State
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Handle resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
    };

    const handleBackToList = () => {
        setSelectedConversation(null);
    };

    const handleConversationCreated = (conversation) => {
        refetch(); // Reload list
        setSelectedConversation(conversation);
    };

    if (loading) return <PageLoader />;

    return (
        <div className="feed-container">
            {!selectedConversation ? (
                /* View 1: Conversation List */
                <div className="messages-view-list">
                    <div className="feed-header sticky-header">
                        <div className="messages-header-content">
                            <h2 className="messages-header-title">{t('messages.title', 'Messages')}</h2>
                            <button
                                className="new-message-btn"
                                onClick={() => setShowNewMessageModal(true)}
                                aria-label={t('messages.new_conversation', 'New Conversation')}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="messages-list-wrapper">
                        <ConversationList
                            conversations={conversations}
                            selectedConversation={selectedConversation}
                            onSelectConversation={handleSelectConversation}
                            currentUserId={currentUser?.id}
                        />
                    </div>
                </div>
            ) : (
                /* View 2: Active Chat */
                <div className="messages-view-chat">
                    {/* ChatWindow has its own header, we just place it here */}
                    <ChatWindow
                        conversation={selectedConversation}
                        currentUserId={currentUser?.id}
                        onBack={handleBackToList}
                    />
                </div>
            )}

            {/* Modals */}
            {showNewMessageModal && (
                <NewConversationModal
                    onClose={() => setShowNewMessageModal(false)}
                    onConversationCreated={handleConversationCreated}
                />
            )}
        </div>
    );
};

export default Messages;
