import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Search, MoreVertical, Shield, UserMinus, ShieldCheck } from 'lucide-react';
import CommunityService from '../services/community.service';
import UserAvatar from '../components/UserAvatar';
import './css/CreateCommunityModal.css'; // Reuse basic modal styles
import { useTranslation } from 'react-i18next';

const ManageMembersModal = ({ isOpen, onClose, communityId }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const { t } = useTranslation();

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const data = await CommunityService.getMembers(communityId);
            setMembers(data);
        } catch (error) {
            console.error('Failed to fetch members', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen, communityId]);

    if (!isOpen) return null;

    const handleAction = async (userId, action) => {
        try {
            await CommunityService.manageMember(communityId, userId, action);
            setActiveMenu(null);
            fetchMembers(); // Refresh list
        } catch (error) {
            alert('Action failed');
        }
    };

    const filteredMembers = members.filter(m =>
        m.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return ReactDOM.createPortal(
        <div className="modal-overlay" style={{ zIndex: 99999 }} onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                    <h3>{t('manage_members.title', 'Manage members')}</h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '0 1.5rem 1rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 15px',
                        background: 'var(--bg-main)',
                        borderRadius: '20px',
                        border: '1px solid var(--border)'
                    }}>
                        <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '10px' }} />
                        <input
                            type="text"
                            placeholder={t('manage_members.search_placeholder', 'Search a member...')}
                            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'var(--text-main)' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>{t('manage_members.loading', 'Loading...')}</div>
                    ) : filteredMembers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{t('manage_members.no_members', 'No members found')}</div>
                    ) : (
                        <div className="members-list">
                            {filteredMembers.map(member => (
                                <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <UserAvatar user={member.user} size={40} />
                                        <div>
                                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {member.user.full_name || member.user.username}
                                                {member.role === 'OWNER' && <ShieldCheck size={14} color="gold" />}
                                                {member.role === 'ADMIN' && <Shield size={14} color="var(--primary)" />}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>@{member.user.username}</div>
                                        </div>
                                    </div>

                                    {member.role !== 'OWNER' && (
                                        <div style={{ position: 'relative' }}>
                                            <button className="ghost-icon-btn" onClick={() => setActiveMenu(activeMenu === member.id ? null : member.id)}>
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeMenu === member.id && (
                                                <div style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: '100%',
                                                    background: 'var(--bg-card)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    zIndex: 10,
                                                    width: '180px',
                                                    overflow: 'hidden'
                                                }}>
                                                    {member.role !== 'ADMIN' && (
                                                        <button
                                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-main)' }}
                                                            onClick={() => handleAction(member.userId, 'promote')}
                                                        >
                                                            <Shield size={16} /> {t('manage_members.promote_admin', 'Promote Admin')}
                                                        </button>
                                                    )}
                                                    <button
                                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}
                                                        onClick={() => handleAction(member.userId, 'kick')}
                                                    >
                                                        <UserMinus size={16} /> {t('manage_members.kick_member', 'Remove from group')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ManageMembersModal;
