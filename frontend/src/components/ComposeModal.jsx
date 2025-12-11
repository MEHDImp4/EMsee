import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Image, BarChart2, Code, Smile, Globe, Users, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import PostService from '../services/post.service';

const ComposeModal = ({ isOpen, onClose, replyTo = null }) => {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyPermission, setReplyPermission] = useState('EVERYONE');
    const [showPermissionMenu, setShowPermissionMenu] = useState(false);
    const permissionMenuRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (permissionMenuRef.current && !permissionMenuRef.current.contains(event.target)) {
                setShowPermissionMenu(false);
            }
        };

        if (showPermissionMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPermissionMenu]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!text.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            if (replyTo) {
                await PostService.commentPost(replyTo.id, text);
            } else {
                await PostService.createPost(text, replyPermission);
            }
            setText('');
            onClose();
        } catch (error) {
            console.error("Failed to submit", error);
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
                        {isSubmitting ? '...' : (replyTo ? t('post.reply', 'Répondre') : t('sidebar.publish', 'Publier'))}
                    </button>
                </div>

                <div className="compose-modal-content">
                    <div className="compose-modal-avatar">
                        <div className="avatar-circle" style={{ width: 40, height: 40 }}>MA</div>
                        {replyTo && <div style={{ width: '2px', background: 'var(--border)', margin: '4px auto 0', height: 'calc(100% - 44px)' }}></div>}
                    </div>

                    <div className="compose-modal-body">
                        {replyTo && (
                            <div className="compose-replying-to">
                                Replying to <span style={{ color: 'var(--primary)' }}>@{replyTo.user?.username}</span>
                            </div>
                        )}

                        <textarea
                            className="compose-modal-input"
                            placeholder={replyTo ? t('post.reply_placeholder', 'Post your reply') : t('feed.placeholder', "Quoi de neuf à l'EMSI ?")}
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

                        <div className="compose-reply-permission" style={{ position: 'relative' }} ref={permissionMenuRef}>
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
                                <div className="permission-menu">
                                    <div
                                        className="permission-item"
                                        onClick={() => { setReplyPermission('EVERYONE'); setShowPermissionMenu(false); }}
                                    >
                                        <Globe size={16} />
                                        <span>Tout le monde</span>
                                    </div>
                                    <div
                                        className="permission-item"
                                        onClick={() => { setReplyPermission('FOLLOWERS'); setShowPermissionMenu(false); }}
                                    >
                                        <Users size={16} />
                                        <span>Abonnés uniquement</span>
                                    </div>
                                    <div
                                        className="permission-item"
                                        onClick={() => { setReplyPermission('NO_ONE'); setShowPermissionMenu(false); }}
                                    >
                                        <Lock size={16} />
                                        <span>Personne</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="compose-modal-footer">
                            <div className="compose-icons" style={{ marginLeft: '-8px' }}>
                                <button className="icon-btn"><Image size={20} color="var(--primary)" /></button>
                                <button className="icon-btn"><BarChart2 size={20} color="var(--primary)" /></button>
                                <button className="icon-btn"><Code size={20} color="var(--primary)" /></button>
                                <button className="icon-btn"><Smile size={20} color="var(--primary)" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ComposeModal;
