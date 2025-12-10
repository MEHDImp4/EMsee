import React, { useState, useEffect } from 'react';
import { Search, MoreHorizontal, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import UserService from '../services/user.service';

const Explore = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('foryou');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const tabs = [
        { id: 'foryou', label: t('explore.tabs.foryou', 'Pour vous') },
        { id: 'users', label: t('explore.tabs.users', 'Utilisateurs') }, // New tab
        { id: 'trending', label: t('explore.tabs.trending', 'Tendances') },
    ];

    const trends = [
        { category: 'Tendances • Maroc', name: '#SaharaMarocain', posts: '12.5k posts' },
        { category: 'Éducation • Tendance', name: 'PFE 2025', posts: '4,203 posts' },
        { category: 'Technologie • Tendance', name: 'React & Tailwind', posts: '1,502 posts' },
        { category: 'Campus', name: 'Hackathon EMSI', posts: '856 posts' },
    ];

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
                setActiveTab('users'); // Switch to users tab on search
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const results = await UserService.searchUsers(searchQuery);
            setSearchResults(results || []);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="explore-page" style={{ flex: 1, borderRight: '1px solid var(--border)' }}>
            {/* Search Header */}
            <div className="feed-header sticky-header" style={{ padding: '0.5rem 1rem' }}>
                <div className="search-bar" style={{ width: '100%' }}>
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t('explore.search_placeholder', 'Rechercher sur EMsee')}
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="feed-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                        {activeTab === tab.id && <div className="tab-indicator" />}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ paddingBottom: '2rem' }}>
                {activeTab === 'foryou' && !searchQuery && (
                    <div className="trends-list">
                        <h3 style={{ padding: '1rem', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                            {t('explore.trends_for_you', 'Tendances pour vous')}
                        </h3>
                        {trends.map((trend, index) => (
                            <div
                                key={index}
                                className="trend-item"
                                style={{
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                        {trend.category}
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                                        {trend.name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {trend.posts}
                                    </div>
                                </div>
                                <button className="more-btn">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {(activeTab === 'users' || searchQuery) && (
                    <div className="users-list">
                        {isSearching ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Recherche en cours...</div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map(user => (
                                <Link to={`/profile/${user.username}`} key={user.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ padding: '1rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                                        <div className="avatar-circle" style={{ width: 40, height: 40, overflow: 'hidden' }}>
                                            {user.avatar ? (
                                                <img src={`http://localhost:5000${user.avatar}`} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                (user.full_name || user.username).charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{user.full_name || user.username}</div>
                                            <div style={{ color: 'var(--text-muted)' }}>@{user.username}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t(`auth.${user.role || 'student'}`)}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : searchQuery ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun utilisateur trouvé pour "{searchQuery}"</div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Utilisez la barre de recherche pour trouver des personnes.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;
