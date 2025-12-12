import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MoreHorizontal } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import UserService from '../services/user.service';

const TRENDS = [
    { metaKey: ['right_sidebar.trending', 'right_sidebar.morocco'], name: '#SaharaMarocain', count: '12.5k' },
    { metaKey: ['right_sidebar.education', 'right_sidebar.trending'], name: 'PFE 2025', count: '4,203' },
    { metaKey: ['right_sidebar.technology', 'right_sidebar.trending'], name: 'React & Tailwind', count: '1,502' }
];

const SearchBox = ({ placeholder }) => (
    <div className="search-container-sticky">
        <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input type="text" placeholder={placeholder} className="search-input" />
        </div>
    </div>
);

const TrendItem = ({ meta, name, count, postsLabel }) => (
    <div className="trend-item">
        <div className="trend-meta">{meta}</div>
        <div className="trend-name">{name}</div>
        <div className="trend-count">{count} {postsLabel}</div>
        <button className="more-btn"><MoreHorizontal size={16} /></button>
    </div>
);

const TrendsSection = ({ t }) => (
    <div className="sidebar-card trends-card">
        <h3>{t('right_sidebar.trends_for_you', 'Tendances pour vous')}</h3>
        {TRENDS.map(({ metaKey, name, count }) => (
            <TrendItem
                key={name}
                meta={`${t(metaKey[0], 'Tendances')} • ${t(metaKey[1], 'Maroc')}`}
                name={name}
                count={count}
                postsLabel={t('right_sidebar.posts', 'posts')}
            />
        ))}
        <div className="show-more">{t('right_sidebar.show_more', 'Voir plus')}</div>
    </div>
);

const SuggestionItem = ({ user, onFollow, t }) => (
    <div className="suggestion-item">
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
            onClick={() => onFollow(user.id)}
            style={user.isFollowing ? { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)' } : {}}
        >
            {user.isFollowing ? t('profile.following', 'Abonné') : t('right_sidebar.follow', 'Suivre')}
        </button>
    </div>
);

const SuggestionsSection = ({ suggestions, loading, onFollow, t }) => (
    <div className="sidebar-card suggestions-card">
        <h3>{t('right_sidebar.suggestions', 'Suggestions')}</h3>

        {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : suggestions.length > 0 ? (
            suggestions.map((user) => (
                <SuggestionItem key={user.id} user={user} onFollow={onFollow} t={t} />
            ))
        ) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No suggestions</div>
        )}
    </div>
);

const RightSidebar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const isExplorePage = location.pathname === '/explore';

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const users = await UserService.getSuggestions();
                setSuggestions(users || []);
            } catch (error) {
                console.error('Failed to load suggestions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    const handleFollow = async (userId) => {
        try {
            await UserService.followUser(userId);
            setSuggestions((prev) => prev.map((user) => (
                user.id === userId
                    ? { ...user, isFollowing: !user.isFollowing }
                    : user
            )));
        } catch (error) {
            console.error('Failed to follow user', error);
        }
    };

    return (
        <aside className="right-sidebar">
            {!isExplorePage && (
                <>
                    <SearchBox placeholder={t('right_sidebar.search', 'Rechercher')} />
                    <TrendsSection t={t} />
                </>
            )}

            <SuggestionsSection
                suggestions={suggestions}
                loading={loading}
                onFollow={handleFollow}
                t={t}
            />
        </aside>
    );
};

export default RightSidebar;
