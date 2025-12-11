import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Image, BarChart2, Code, Smile, Globe, Users, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import PostService from '../services/post.service';

const ComposeModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyPermission, setReplyPermission] = useState('EVERYONE');
    const [showPermissionMenu, setShowPermissionMenu] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!text.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await PostService.createPost(text, replyPermission);
            setText('');
            onClose();
            // Ideally notify feed to refresh, but for now just close
        } catch (error) {
            console.error("Failed to submit post", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="compose-modal-overlay">
            <div className="compose-modal">
                <div className="compose-modal-header">
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                    <button
                        className="post-btn-small"
                        disabled={!text.trim() || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? '...' : t('sidebar.publish', 'Publier')}
                    </button>
                </div>

                <div className="compose-modal-content">
                    <div className="compose-user-row">
                        <div className="avatar-circle" style={{ width: 40, height: 40 }}>MA</div>
                    </div>

                    <textarea
                        className="compose-modal-input"
                        placeholder={t('feed.placeholder', "Quoi de neuf à l'EMSI ?")}
                        autoFocus
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />

                    <div className="compose-reply-permission" style={{ position: 'relative', cursor: 'pointer' }}>
                        <div
                            onClick={() => setShowPermissionMenu(!showPermissionMenu)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {replyPermission === 'EVERYONE' && <Globe size={16} />}
                            {replyPermission === 'FOLLOWERS' && <Users size={16} />}
                            {replyPermission === 'NO_ONE' && <Lock size={16} />}

                            <span>
                                {replyPermission === 'EVERYONE' && t('feed.everyone_can_reply', 'Tout le monde peut répondre')}
                                {replyPermission === 'FOLLOWERS' && t('feed.followers_can_reply', 'Abonnés uniquement')}
                                {replyPermission === 'NO_ONE' && t('feed.no_one_can_reply', 'Personne ne peut répondre')}
                            </span>
                        </div>

                        {showPermissionMenu && (
                            <div className="permission-menu" style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '8px',
                                zIndex: 100,
                                width: '250px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}>
                                <div
                                    className="permission-item"
                                    onClick={() => { setReplyPermission('EVERYONE'); setShowPermissionMenu(false); }}
                                    style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    <Globe size={16} />
                                    <span>Tout le monde</span>
                                </div>
                                <div
                                    className="permission-item"
                                    onClick={() => { setReplyPermission('FOLLOWERS'); setShowPermissionMenu(false); }}
                                    style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    <Users size={16} />
                                    <span>Abonnés uniquement</span>
                                </div>
                                <div
                                    className="permission-item"
                                    onClick={() => { setReplyPermission('NO_ONE'); setShowPermissionMenu(false); }}
                                    style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    <Lock size={16} />
                                    <span>Personne</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="compose-modal-footer">
                        <div className="compose-icons" style={{ marginLeft: 0 }}>
                            <button className="icon-btn"><Image size={24} color="var(--primary)" /></button>
                            <button className="icon-btn"><BarChart2 size={24} color="var(--primary)" /></button>
                            <button className="icon-btn"><Code size={24} color="var(--primary)" /></button>
                            <button className="icon-btn"><Smile size={24} color="var(--primary)" /></button>
                        </div>
                        {/* Character count or other indicators could go here */}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ComposeModal;
