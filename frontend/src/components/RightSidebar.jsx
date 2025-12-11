import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserService from '../services/user.service';

const RightSidebar = () => {
    const { t } = useTranslation();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const users = await UserService.getSuggestions();
                setSuggestions(users || []);
            } catch (error) {
                console.error("Failed to load suggestions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    const handleFollow = async (userId) => {
        try {
            await UserService.followUser(userId);
            setSuggestions(prev => prev.map(user =>
                user.id === userId
                    ? { ...user, isFollowing: !user.isFollowing }
                    : user
            ));
        } catch (error) {
            console.error("Failed to follow user", error);
        }
    };

    return (
        <aside className="right-sidebar">
            <div className="search-container-sticky">
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t('right_sidebar.search', 'Rechercher')}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="sidebar-card trends-card">
                <h3>{t('right_sidebar.trends_for_you', 'Tendances pour vous')}</h3>

                <div className="trend-item">
                    <div className="trend-meta">{t('right_sidebar.trending', 'Tendances')} • {t('right_sidebar.morocco', 'Maroc')}</div>
                    <div className="trend-name">#SaharaMarocain</div>
                    <div className="trend-count">12.5k {t('right_sidebar.posts', 'posts')}</div>
                    <button className="more-btn"><MoreHorizontal size={16} /></button>
                </div>

                <div className="trend-item">
                    <div className="trend-meta">{t('right_sidebar.education', 'Éducation')} • {t('right_sidebar.trending', 'Tendances')}</div>
                    <div className="trend-name">PFE 2025</div>
                    <div className="trend-count">4,203 {t('right_sidebar.posts', 'posts')}</div>
                    <button className="more-btn"><MoreHorizontal size={16} /></button>
                </div>

                <div className="trend-item">
                    <div className="trend-meta">{t('right_sidebar.technology', 'Technologie')} • {t('right_sidebar.trending', 'Tendances')}</div>
                    <div className="trend-name">React & Tailwind</div>
                    <div className="trend-count">1,502 {t('right_sidebar.posts', 'posts')}</div>
                    <button className="more-btn"><MoreHorizontal size={16} /></button>
                </div>

                <div className="show-more">{t('right_sidebar.show_more', 'Voir plus')}</div>
            </div>

            <div className="sidebar-card suggestions-card">
                <h3>{t('right_sidebar.suggestions', 'Suggestions')}</h3>

                {loading ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                ) : suggestions.length > 0 ? (
                    suggestions.map(user => (
                        <div key={user.id} className="suggestion-item">
                            <Link to={`/profile/${user.username}`} className="suggestion-avatar" style={{ textDecoration: 'none', display: 'block' }}>
                                <div className="avatar-circle" style={{ width: 40, height: 40, overflow: 'hidden' }}>
                                    {user.avatar ? (
                                        <img src={`http://localhost:5000${user.avatar}`} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (user.full_name || user.username).charAt(0).toUpperCase()
                                    )}
                                </div>
                            </Link>
                            <div className="suggestion-info">
                                <Link to={`/profile/${user.username}`} className="suggestion-name" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'block' }}>
                                    {user.full_name || user.username}
                                </Link>
                                <div className="suggestion-handle">@{user.username}</div>
                            </div>
                            <button
                                className={`btn-follow ${user.isFollowing ? 'following' : ''}`}
                                onClick={() => handleFollow(user.id)}
                                style={user.isFollowing ? { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)' } : {}}
                            >
                                {user.isFollowing ? t('profile.following', 'Abonné') : t('right_sidebar.follow', 'Suivre')}
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No suggestions</div>
                )}
            </div>
        </aside>
    );
};

export default RightSidebar;
