import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Image as ImageIcon, BarChart2, Code, Globe, Users, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import PostService from '../services/post.service';

import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { BASE_URL } from '../services/api';
import UserAvatar from './UserAvatar';
import './css/ComposeModal.css'; // Import custom styles

const ComposeModal = ({ isOpen, onClose, replyTo = null, onPostCreated }) => { // Added onPostCreated prop
    const { t } = useTranslation();
    const { user } = useAuth();
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyPermission, setReplyPermission] = useState('EVERYONE');
    const [showPermissionMenu, setShowPermissionMenu] = useState(false);
    const permissionMenuRef = React.useRef(null);

    // Get user info for avatar
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const userName = user?.full_name || user?.name || 'User';
    const userInitials = getInitials(userName);
    const avatarUrl = user?.avatar ? `${BASE_URL}${user.avatar}` : null;

    // Media/Poll/Code states
    const [images, setImages] = useState([]);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [pollData, setPollData] = useState({ question: '', options: ['', ''], endsAt: '' });
    const [codeData, setCodeData] = useState({ code: '', language: 'javascript' });
    const fileInputRef = React.useRef(null);

    // Reset all states when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setShowPollCreator(false);
            setShowCodeEditor(false);
            setShowPermissionMenu(false);
        }
    }, [isOpen]);

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

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        try {
            const response = await api.post('/media/upload', formData);
            const uploadedImages = response.files.map(f => ({
                type: 'IMAGE',
                url: f.path
            }));
            setImages(prev => [...prev, ...uploadedImages]);
        } catch (error) {
            console.error('Image upload failed:', error);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const addPollOption = () => {
        if (pollData.options.length < 4) {
            setPollData(prev => ({ ...prev, options: [...prev.options, ''] }));
        }
    };

    const removePollOption = (index) => {
        if (pollData.options.length > 2) {
            setPollData(prev => ({
                ...prev,
                options: prev.options.filter((_, i) => i !== index)
            }));
        }
    };

    const { isComposeOpen, modalOptions, closeCompose, replyTo: contextReplyTo } = useModal(); // Get modalOptions from context

    const activeReplyTo = replyTo || contextReplyTo;

    // Reset all states when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            // ... (reset logic)
        }
    }, [isOpen]);

    // ... (rest of logic)

    const handleSubmit = async () => {
        if ((!text.trim() && images.length === 0 && !showPollCreator && !showCodeEditor) || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // ... (prepare data)
            let mediaData = images;
            if (showCodeEditor && codeData.code.trim()) {
                mediaData = [...mediaData, { type: 'CODE', code: codeData.code, language: codeData.language }];
            }

            const poll = showPollCreator && pollData.question.trim() ? {
                question: pollData.question,
                options: pollData.options.filter(o => o.trim()),
                endsAt: pollData.endsAt || null
            } : null;

            const newPost = await PostService.createPost(
                text,
                replyPermission,
                mediaData.length > 0 ? mediaData : null,
                poll,
                activeReplyTo ? activeReplyTo.id : null
            );

            // Trigger callback if provided (either via prop or context options)
            if (onPostCreated) onPostCreated(newPost);
            if (modalOptions?.onSuccess) modalOptions.onSuccess(newPost);

            setText('');
            setImages([]);
            setPollData({ question: '', options: ['', ''], endsAt: '' });
            setCodeData({ code: '', language: 'javascript' });
            setShowPollCreator(false);
            setShowCodeEditor(false);
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
                        {isSubmitting ? '...' : (activeReplyTo ? t('post.reply', 'Reply') : t('sidebar.publish', 'Publish'))}
                    </button>
                </div>

                <div className="compose-modal-content">
                    <div className="compose-modal-avatar">
                        <UserAvatar user={user} size={40} className="avatar-circle" />
                        {activeReplyTo && <div className="reply-line"></div>}
                    </div>

                    <div className="compose-modal-body">
                        {activeReplyTo && (
                            <div className="compose-replying-to">
                                Replying to <span>@{activeReplyTo.user?.username}</span>
                            </div>
                        )}

                        <textarea
                            className="compose-modal-input"
                            placeholder={activeReplyTo ? t('post.reply_placeholder', 'Post your reply') : t('feed.placeholder', "What's happening at EMSI?")}
                            autoFocus
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />

                        {!activeReplyTo && (
                            <div className="compose-reply-permission" ref={permissionMenuRef} onClick={() => setShowPermissionMenu(!showPermissionMenu)}>
                                {replyPermission === 'EVERYONE' && <Globe size={16} />}
                                {replyPermission === 'FOLLOWERS' && <Users size={16} />}
                                {replyPermission === 'NO_ONE' && <Lock size={16} />}

                                <span>
                                    {replyPermission === 'EVERYONE' && t('compose.permission.everyone', 'Everyone can reply')}
                                    {replyPermission === 'FOLLOWERS' && t('compose.permission.followers', 'Followers only')}
                                    {replyPermission === 'NO_ONE' && t('compose.permission.none', 'No one')}
                                </span>

                                {showPermissionMenu && (
                                    <div className="permission-menu">
                                        <div
                                            className="permission-item"
                                            onClick={() => { setReplyPermission('EVERYONE'); setShowPermissionMenu(false); }}
                                        >
                                            <Globe size={16} />
                                            <span>{t('compose.permission.everyone_short', 'Everyone')}</span>
                                        </div>
                                        <div
                                            className="permission-item"
                                            onClick={() => { setReplyPermission('FOLLOWERS'); setShowPermissionMenu(false); }}
                                        >
                                            <Users size={16} />
                                            <span>{t('compose.permission.followers_short', 'Followers')}</span>
                                        </div>
                                        <div
                                            className="permission-item"
                                            onClick={() => { setReplyPermission('NO_ONE'); setShowPermissionMenu(false); }}
                                        >
                                            <Lock size={16} />
                                            <span>{t('compose.permission.none_short', 'No one')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {images.length > 0 && (
                            <div className="compose-images-preview" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                                {images.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', paddingTop: '100%', borderRadius: '0.5rem', overflow: 'hidden', background: 'var(--bg-card)' }}>
                                        <img src={`${BASE_URL}${img.url}`} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showPollCreator && (
                            <div className="compose-poll-creator" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder={t('compose.poll.question_placeholder', 'Ask a question...')}
                                    value={pollData.question}
                                    onChange={(e) => setPollData(prev => ({ ...prev, question: e.target.value }))}
                                    style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                />
                                {pollData.options.map((opt, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder={t('compose.poll.option_placeholder', `Option ${idx + 1}`)}
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...pollData.options];
                                                newOpts[idx] = e.target.value;
                                                setPollData(prev => ({ ...prev, options: newOpts }));
                                            }}
                                            style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                        {pollData.options.length > 2 && (
                                            <button onClick={() => removePollOption(idx)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer' }}>
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {pollData.options.length < 4 && (
                                    <button onClick={addPollOption} style={{ padding: '0.5rem 1rem', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', borderRadius: '0.25rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                                        {t('compose.poll.add_option', 'Add option')}
                                    </button>
                                )}
                                <button onClick={() => setShowPollCreator(false)} style={{ padding: '0.5rem 1rem', border: 'none', background: 'var(--danger)', color: 'white', borderRadius: '0.25rem', cursor: 'pointer', marginTop: '0.5rem', marginLeft: '0.5rem' }}>
                                    {t('compose.poll.remove_poll', 'Remove poll')}
                                </button>
                            </div>
                        )}

                        {showCodeEditor && (
                            <div className="compose-code-editor" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem', background: 'var(--bg-main)' }}>
                                <select
                                    value={codeData.language}
                                    onChange={(e) => setCodeData(prev => ({ ...prev, language: e.target.value }))}
                                    style={{ padding: '0.5rem', marginBottom: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                                >
                                    <option value="javascript">{t('media.languages.javascript', 'JavaScript')}</option>
                                    <option value="python">{t('media.languages.python', 'Python')}</option>
                                    <option value="java">{t('media.languages.java', 'Java')}</option>
                                    <option value="cpp">{t('media.languages.cpp', 'C++')}</option>
                                    <option value="html">{t('media.languages.html', 'HTML')}</option>
                                    <option value="css">{t('media.languages.css', 'CSS')}</option>
                                </select>
                                <textarea
                                    value={codeData.code}
                                    onChange={(e) => setCodeData(prev => ({ ...prev, code: e.target.value }))}
                                    placeholder={t('media_picker.code_placeholder', 'Paste your code here...')}
                                    style={{ width: '100%', minHeight: '150px', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.25rem', fontFamily: 'monospace', fontSize: '0.9rem', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                                />
                                <button onClick={() => setShowCodeEditor(false)} style={{ padding: '0.5rem 1rem', border: 'none', background: 'var(--danger)', color: 'white', borderRadius: '0.25rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                    {t('compose.code.remove_code', 'Remove code')}
                                </button>
                            </div>
                        )}

                        <div className="compose-modal-footer">
                            <div className="compose-icons">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                <button className="icon-btn" type="button" onClick={() => fileInputRef.current?.click()} disabled={images.length >= 4}>
                                    <ImageIcon size={20} color={images.length >= 4 ? 'var(--text-muted)' : 'var(--primary)'} />
                                </button>
                                <button className="icon-btn" type="button" onClick={() => setShowPollCreator(!showPollCreator)} disabled={showCodeEditor}>
                                    <BarChart2 size={20} color={showCodeEditor ? 'var(--text-muted)' : 'var(--primary)'} />
                                </button>
                                <button className="icon-btn" type="button" onClick={() => setShowCodeEditor(!showCodeEditor)} disabled={showPollCreator}>
                                    <Code size={20} color={showPollCreator ? 'var(--text-muted)' : 'var(--primary)'} />
                                </button>
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
