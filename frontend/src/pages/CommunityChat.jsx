import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Image as ImageIcon, Info, MoreVertical, Trash, Settings, Users, LogOut, X, AtSign, Smile } from 'lucide-react';
import { uploadImages } from '../services/media.service';
import { BASE_URL } from '../services/api';
import EditCommunityModal from '../components/EditCommunityModal';
import ManageMembersModal from '../components/ManageMembersModal';
import CommunityService from '../services/community.service';
import { useTranslation } from 'react-i18next';
import UserAvatar from '../components/UserAvatar';
import PageLoader from '../components/loaders/PageLoader';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    color: 'var(--text-main)',
    fontSize: '0.95rem'
};

const CommunityChat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [community, setCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Image Upload State
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Modals and Menu
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchDetails = async () => {
        try {
            const commData = await CommunityService.getCommunity(id);
            setCommunity(commData);

            if (commData.membership && commData.membership.status === 'ACTIVE') {
                const msgs = await CommunityService.getMessages(id);
                setMessages(msgs);
            }
        } catch (error) {
            console.error('Error fetching community', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleJoin = async () => {
        try {
            await CommunityService.joinCommunity(id);
            fetchDetails();
        } catch (error) {
            alert(error.response?.data?.message || t('community.errors.failed_join', 'Failed to join'));
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview({
                    file: file,
                    preview: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const [activeReactionMessage, setActiveReactionMessage] = useState(null);

    const handleReaction = async (messageId, emoji) => {
        // Optimistic update
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const existingReaction = msg.reactions?.find(r => r.userId === user.id && r.emoji === emoji);
                let newReactions = msg.reactions || [];

                if (existingReaction) {
                    newReactions = newReactions.filter(r => r.id !== existingReaction.id);
                } else {
                    newReactions = [...newReactions, { id: 'temp-' + Date.now(), userId: user.id, emoji }];
                }
                return { ...msg, reactions: newReactions };
            }
            return msg;
        }));
        setActiveReactionMessage(null);

        try {
            await CommunityService.toggleReaction(id, messageId, emoji);
        } catch (error) {
            console.error('Failed to react:', error);
            fetchDetails(); // Revert
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !imagePreview) return;

        try {
            setUploading(true);
            let imageUrl = null;

            if (imagePreview) {
                const urls = await uploadImages([imagePreview.file]);
                imageUrl = urls[0];
            }

            const contentToSend = (newMessage + (imageUrl ? `\n${imageUrl}` : '')).trim();

            if (contentToSend) {
                const sentMsg = await CommunityService.sendMessage(id, contentToSend);
                setMessages(prev => [...prev, sentMsg]);
                setNewMessage('');
                clearImage();
            }
        } catch (error) {
            console.error('Failed to send', error);
            alert(error.response?.data?.message || t('community.errors.failed_send', 'Failed to send'));
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteCommunity = async () => {
        if (window.confirm(t('community.confirm_delete_warning', 'Are you sure you want to delete this community? This action is irreversible.'))) {
            if (window.confirm(t('community.confirm_delete_final', 'Final confirmation: Delete permanently?'))) {
                try {
                    await CommunityService.deleteCommunity(id);
                    navigate('/community');
                } catch (error) {
                    alert(t('community.errors.delete_failed', 'Error deleting community'));
                }
            }
        }
    };

    const handleLeave = async () => {
        if (window.confirm(t('community.confirm_leave', 'Do you really want to leave this group?'))) {
            try {
                await CommunityService.leaveCommunity(id);
                navigate('/community');
            } catch (error) {
                alert(t('community.errors.leave_failed', 'Error'));
            }
        }
    };

    if (loading) return <PageLoader />;
    if (!community) return <div>{t('community.not_found', 'Community not found')}</div>;

    const isMember = community.membership?.status === 'ACTIVE';
    const isPending = community.membership?.status === 'PENDING';
    const canWrite = community.writeAccess === 'EVERYONE' ||
        (community.writeAccess === 'ADMINS_ONLY' && ['OWNER', 'ADMIN'].includes(community.membership?.role));

    return (
        <div className="feed-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="feed-header sticky-header" style={{ flexShrink: 0 }}>
                <div style={{ padding: '0 1rem', height: '53px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => navigate('/community')} className="ghost-icon-btn">
                        <ArrowLeft size={20} />
                    </button>

                    <div style={{
                        width: 36, height: 36, borderRadius: 12, overflow: 'hidden',
                        background: community.icon ? 'transparent' : 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--border)',
                        flexShrink: 0
                    }}>
                        {community.icon ? (
                            <img
                                src={community.icon.startsWith('http') ? community.icon : `${BASE_URL}${community.icon}`}
                                alt={community.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {community.name.substring(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0 }}>{community.name}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {community._count?.members || 1} {t('community.members', 'members')}
                        </span>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button className="ghost-icon-btn" onClick={() => setShowMenu(!showMenu)}>
                            <MoreVertical size={20} />
                        </button>

                        {showMenu && (
                            <div className="dropdown-menu" style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 50,
                                width: '220px',
                                padding: '5px',
                                overflow: 'hidden'
                            }}>
                                <div className="menu-backdrop" style={{ position: 'fixed', inset: 0, zIndex: -1 }} onClick={() => setShowMenu(false)} />

                                {community.membership?.role === 'OWNER' && (
                                    <>
                                        <button onClick={() => { setIsEditModalOpen(true); setShowMenu(false); }} style={menuItemStyle}>
                                            <Settings size={16} /> {t('community.edit', 'Edit community')}
                                        </button>
                                        <button onClick={() => { setIsMembersModalOpen(true); setShowMenu(false); }} style={menuItemStyle}>
                                            <Users size={16} /> {t('community.manage_members', 'Manage members')}
                                        </button>
                                        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                                        <button onClick={handleDeleteCommunity} style={{ ...menuItemStyle, color: 'var(--danger)' }}>
                                            <Trash size={16} /> {t('community.delete', 'Delete community')}
                                        </button>
                                    </>
                                )}

                                {community.membership?.role !== 'OWNER' && (
                                    <button onClick={handleLeave} style={{ ...menuItemStyle, color: 'var(--danger)' }}>
                                        <LogOut size={16} /> {t('community.leave_group', 'Leave group')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <EditCommunityModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                community={community}
                onUpdate={(updated) => setCommunity(prev => ({ ...prev, ...updated }))}
            />

            <ManageMembersModal
                isOpen={isMembersModalOpen}
                onClose={() => setIsMembersModalOpen(false)}
                communityId={id}
            />

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {!isMember ? (
                    <div style={{ textAlign: 'center', marginTop: '20vh' }}>
                        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem', color: 'white' }}>
                            {community.name.substring(0, 2).toUpperCase()}
                        </div>
                        <h2>{community.name}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{community.description}</p>

                        {isPending ? (
                            <button disabled className="submit-btn" style={{ opacity: 0.7 }}>{t('community.request_sent', 'Request sent')}</button>
                        ) : (
                            <button onClick={handleJoin} className="submit-btn">
                                {t('community.join_group', 'Join group')}
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {messages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <p>{t('community.start_conversation', 'Start of conversation')}</p>
                            </div>
                        ) : (
                            messages.map(msg => {
                                const groupedReactions = (msg.reactions || []).reduce((acc, r) => {
                                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                    return acc;
                                }, {});
                                const userReactedEmojis = new Set((msg.reactions || []).filter(r => r.userId === user.id).map(r => r.emoji));

                                return (
                                    <div key={msg.id} style={{
                                        display: 'flex',
                                        gap: '12px',
                                        marginBottom: '16px',
                                        alignItems: 'flex-start',
                                        position: 'relative'
                                    }}>
                                        <UserAvatar user={msg.sender} size={40} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                                    {msg.sender.full_name}
                                                </span>

                                                {msg.sender.role && (
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        padding: '1px 6px',
                                                        borderRadius: '4px',
                                                        background: 'var(--bg-secondary)',
                                                        border: '1px solid var(--border)',
                                                        color: 'var(--text-muted)',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {msg.sender.role.toLowerCase()}
                                                    </span>
                                                )}

                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    @{msg.sender.username || 'unknown'}
                                                </span>

                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    • {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: fr })}
                                                </span>
                                            </div>

                                            <div style={{
                                                color: 'var(--text-main)',
                                                fontSize: '0.95rem',
                                                lineHeight: '1.5',
                                                whiteSpace: 'pre-wrap',
                                                position: 'relative',
                                                paddingRight: '30px'
                                            }}>
                                                <button
                                                    onClick={() => setActiveReactionMessage(activeReactionMessage === msg.id ? null : msg.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: -20,
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--text-muted)',
                                                        opacity: activeReactionMessage === msg.id ? 1 : 0.5,
                                                        padding: 4
                                                    }}
                                                    title={t('community.add_reaction', 'Add reaction')}
                                                >
                                                    <Smile size={18} />
                                                </button>

                                                {activeReactionMessage === msg.id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: 0,
                                                        background: 'var(--bg-secondary)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '20px',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        gap: '4px',
                                                        zIndex: 10,
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                                                            <button
                                                                key={emoji}
                                                                onClick={() => handleReaction(msg.id, emoji)}
                                                                style={{
                                                                    background: userReactedEmojis.has(emoji) ? 'color-mix(in srgb, var(--primary) 20%, transparent)' : 'transparent',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    fontSize: '1.2rem',
                                                                    padding: '4px',
                                                                    borderRadius: '50%',
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {msg.content.split('\n').map((line, i) => {
                                                    if (line.trim().startsWith('/uploads/images/')) {
                                                        return (
                                                            <div key={i} style={{ marginTop: 8, marginBottom: 8 }}>
                                                                <img
                                                                    src={`${BASE_URL}${line.trim()}`}
                                                                    alt="Attachment"
                                                                    style={{ maxWidth: '100%', borderRadius: 12, maxHeight: 400, objectFit: 'cover', border: '1px solid var(--border)' }}
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                            </div>
                                                        );
                                                    }
                                                    // Highlight @everyone
                                                    const parts = line.split(/(@everyone)/g);
                                                    return (
                                                        <div key={i}>
                                                            {parts.map((part, pIndex) =>
                                                                part === '@everyone' ? (
                                                                    <span key={pIndex} style={{
                                                                        color: 'var(--primary)',
                                                                        background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                                                                        padding: '0 4px',
                                                                        borderRadius: '4px',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        @everyone
                                                                    </span>
                                                                ) : part
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {Object.keys(groupedReactions).length > 0 && (
                                                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                                    {Object.entries(groupedReactions).map(([emoji, count]) => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => handleReaction(msg.id, emoji)}
                                                            style={{
                                                                background: userReactedEmojis.has(emoji)
                                                                    ? 'color-mix(in srgb, var(--primary) 15%, transparent)'
                                                                    : 'var(--bg-secondary)',
                                                                border: userReactedEmojis.has(emoji)
                                                                    ? '1px solid var(--primary)'
                                                                    : '1px solid var(--border)',
                                                                borderRadius: '12px',
                                                                padding: '2px 8px',
                                                                fontSize: '0.8rem',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                color: 'var(--text-main)'
                                                            }}
                                                        >
                                                            <span>{emoji}</span>
                                                            <span style={{ fontWeight: 600 }}>{count}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            {isMember && (
                <div style={{ padding: '10px', borderTop: '1px solid var(--border)', background: 'var(--bg-main)' }}>

                    {/* Image Preview */}
                    {imagePreview && (
                        <div style={{ padding: '0 0 10px 10px', position: 'relative', display: 'inline-block' }}>
                            <img src={imagePreview.preview} alt="Preview" style={{ height: 80, borderRadius: 8, border: '1px solid var(--border)' }} />
                            <button
                                onClick={clearImage}
                                style={{
                                    position: 'absolute', top: -5, right: -5,
                                    background: 'var(--danger)', borderRadius: '50%',
                                    color: 'white', padding: 4, cursor: 'pointer',
                                    border: '2px solid var(--bg-main)'
                                }}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    {canWrite ? (
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                            />
                            <button type="button" className="ghost-icon-btn" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon size={20} />
                            </button>

                            {['OWNER', 'ADMIN'].includes(community.membership?.role) && (
                                <button
                                    type="button"
                                    className="ghost-icon-btn"
                                    onClick={() => setNewMessage(prev => prev + '@everyone ')}
                                    title={t('community.mention_everyone', 'Mention everyone')}
                                >
                                    <AtSign size={20} />
                                </button>
                            )}

                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={t('community.input_placeholder', 'Message...')}
                                disabled={uploading}
                                style={{
                                    flex: 1,
                                    padding: '10px 15px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-main)'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={(!newMessage.trim() && !imagePreview) || uploading}
                                style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: (!newMessage.trim() && !imagePreview) || uploading ? 'default' : 'pointer',
                                    opacity: (!newMessage.trim() && !imagePreview) || uploading ? 0.5 : 1
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {t('community.admins_only', 'Only admins can write here.')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommunityChat;
