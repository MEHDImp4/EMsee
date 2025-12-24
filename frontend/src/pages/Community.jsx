import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Users, Lock, Search } from 'lucide-react';
import CommunityService from '../services/community.service';
import UserAvatar from '../components/UserAvatar';
import PageLoader from '../components/loaders/PageLoader';
import CreateCommunityModal from '../components/CreateCommunityModal';
import { useNavigate } from 'react-router-dom';
import './css/Community.css';

const CommunityIcon = ({ community }) => {
    const [imageError, setImageError] = useState(false);

    if (community.icon && !imageError) {
        return (
            <div className="community-icon-placeholder">
                <img
                    src={community.icon}
                    alt={community.name}
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    return (
        <div className="community-icon-placeholder">
            <span>{community.name.substring(0, 2).toUpperCase()}</span>
        </div>
    );
};

const Community = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my'); // 'my' or 'discover'
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        console.log("Community Component MOUNTED");
        return () => console.log("Community Component UNMOUNTED");
    }, []);

    console.log("Community Rendered. Modal State:", showCreateModal);

    const fetchCommunities = async () => {
        setLoading(true);
        try {
            const data = await CommunityService.getCommunities(activeTab);
            setCommunities(data);
        } catch (error) {
            console.error('Failed to fetch communities', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, [activeTab]);

    const handleCommunityClick = (community) => {
        navigate(`/community/${community.id}`);
    };

    return (
        <div className="feed-container">
            <div className="feed-header sticky-header">
                <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '53px' }}>
                    <h2 className="header-title">{t('sidebar.community', 'Communauté')}</h2>
                    <button
                        type="button"
                        className="create-community-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="community-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my')}
                    >
                        {t('community.tabs.my', "My Groups")}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
                        onClick={() => setActiveTab('discover')}
                    >
                        {t('community.tabs.discover', 'Discover')}
                    </button>
                </div>
            </div>

            <div className="communities-list">
                {loading ? (
                    <PageLoader />
                ) : communities.length === 0 ? (
                    <div className="empty-state">
                        <Users size={48} className="empty-icon" />
                        <h3>
                            {activeTab === 'my'
                                ? t('community.empty_my', "You haven't joined any groups")
                                : t('community.empty_discover', 'No public groups found')}
                        </h3>
                        <p>
                            {activeTab === 'my'
                                ? t('community.empty_my_desc', 'Join communities or create a new one!')
                                : t('community.empty_discover_desc', 'Be the first to create a public group!')}
                        </p>
                    </div>
                ) : (
                    communities.map(community => (
                        <div
                            key={community.id}
                            className="community-card"
                            onClick={() => handleCommunityClick(community)}
                        >
                            <CommunityIcon community={community} />
                            <div className="community-info">
                                <div className="community-name-row">
                                    <h4>{community.name}</h4>
                                    {community.privacy === 'PRIVATE' && <Lock size={14} className="lock-icon" />}
                                </div>
                                <p className="community-desc">{community.description || t('community.no_description', 'No description')}</p>
                                <div className="community-meta">
                                    <span>{community._count?.members || 1} {t('community.members', 'members')}</span>
                                </div>
                            </div>
                            {activeTab === 'discover' && (
                                <button className="join-btn-small">{t('community.view_button', 'View')}</button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {showCreateModal && (
                <CreateCommunityModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setActiveTab('my');
                        fetchCommunities();
                    }}
                />
            )}
        </div>
    );
};

export default Community;
