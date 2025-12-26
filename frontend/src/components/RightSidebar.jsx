import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MoreHorizontal, TrendingUp } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserService from '../services/user.service';
import HashtagService from '../services/hashtag.service';
import { BASE_URL } from '../services/api';
import { getInitials } from '../utils/avatarUtils';
import UserAvatar from './UserAvatar';

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

const TrendingHashtagItem = ({ tag, t }) => {
    const navigate = useNavigate();

    return (
        <div
            className="trend-item hashtag-trend"
            onClick={() => navigate(`/explore?q=%23${tag.name}`)}
            style={{ cursor: 'pointer' }}
        >
            <div className="trend-meta">
                <TrendingUp size={14} style={{ marginRight: '4px' }} />
                {t('right_sidebar.trending', 'Tendances')}
            </div>
            <div className="trend-name">#{tag.name}</div>
            <div className="trend-count">
                {tag.totalCount} {t('right_sidebar.posts', 'posts')}
            </div>
        </div>
    );
};

const TrendItem = ({ meta, name, count, postsLabel }) => {
    const encoded = name?.startsWith('#')
        ? `%23${name.replace(/^#/, '')}`
        : encodeURIComponent(name || '');

    return (
        <Link
            to={`/explore?q=${encoded}`}
            className="trend-item"
            style={{ textDecoration: 'none' }}
        >
            <div className="trend-meta">{meta}</div>
            <div className="trend-name">{name}</div>
            <div className="trend-count">{count} {postsLabel}</div>
            <button
                className="more-btn"
                onClick={(e) => e.preventDefault()}
                aria-label="More options"
            >
                <MoreHorizontal size={16} />
            </button>
        </Link>
    );
};

const TrendsSection = ({ t, trendingHashtags, loadingHashtags }) => (
    <div className="sidebar-card trends-card">
        <h3>{t('right_sidebar.trends_for_you', 'Tendances pour vous')}</h3>

        {loadingHashtags ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                {t('common.loading', 'Loading...')}
            </div>
        ) : trendingHashtags && trendingHashtags.length > 0 ? (
            <>
                {trendingHashtags.map(tag => (
                    <TrendingHashtagItem key={tag.name} tag={tag} t={t} />
                ))}
                <Link to="/explore" className="show-more" style={{ textDecoration: 'none' }}>
                    {t('right_sidebar.show_more', 'Voir plus')}
                </Link>
            </>
        ) : (
            TRENDS.map(({ metaKey, name, count }) => (
                <TrendItem
                    key={name}
                    meta={`${t(metaKey[0], 'Tendances')} • ${t(metaKey[1], 'Maroc')}`}
                    name={name}
                    count={count}
                    postsLabel={t('right_sidebar.posts', 'posts')}
                />
            ))
        )}
    </div>
);



const SuggestionItem = ({ user, onFollow, t }) => {
    const navigate = useNavigate();
    const toSearch = `/explore?q=%40${user.username}`;
    const initials = getInitials(user.full_name || user.username);

    return (
        <div
            className="suggestion-item"
            onClick={() => navigate(toSearch)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(toSearch); }}
            style={{ cursor: 'pointer' }}
        >
            <Link to={toSearch} className="suggestion-avatar" style={{ textDecoration: 'none', display: 'block' }}>
                <UserAvatar user={user} size={40} className="avatar-circle" />
            </Link>
            <div className="suggestion-info">
                <Link to={toSearch} className="suggestion-name" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'block' }}>
                    {user.full_name || user.username}
                </Link>
                <div className="suggestion-handle">@{user.username}</div>
            </div>
            <button
                className={`btn-follow ${user.isFollowing ? 'following' : ''}`}
                onClick={(e) => { e.stopPropagation(); onFollow(user.id); }}
                style={user.isFollowing ? { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)' } : {}}
            >
                {user.isFollowing ? t('profile.following', 'Abonné') : t('right_sidebar.follow', 'Suivre')}
            </button>
        </div >
    );
};

const SuggestionsSection = ({ suggestions, loading, onFollow, t, loadMore, hasMore }) => {
    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observerTarget.current && observer.unobserve(observerTarget.current);
    }, [hasMore, loading, loadMore]);

    return (
        <div className="sidebar-card suggestions-card">
            <h3>{t('right_sidebar.suggestions', 'Suggestions')}</h3>
            <div className="suggestions-list">
                {suggestions && suggestions.length > 0 ? (
                    <>
                        {suggestions.map((user) => (
                            <SuggestionItem key={user.id} user={user} onFollow={onFollow} t={t} />
                        ))}
                        {/* Observer for infinite loading */}
                        <div ref={observerTarget} style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            {loading && t('common.loading', '...')}
                        </div>
                    </>
                ) : !loading && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('right_sidebar.no_suggestions', 'No suggestions')}</div>
                )}
            </div>
        </div>
    );
};

const RightSidebar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trendingHashtags, setTrendingHashtags] = useState([]);
    const [loadingHashtags, setLoadingHashtags] = useState(true);
    // suggestions pagination
    const [suggestionsPage, setSuggestionsPage] = useState(1);
    const [hasMoreSuggestions, setHasMoreSuggestions] = useState(true);

    const isExplorePage = location.pathname === '/explore';

    useEffect(() => {
        const fetchSuggestions = async (pageNum = 1) => {
            try {
                if (pageNum === 1) setLoading(true);
                const users = await UserService.getSuggestions(3, pageNum);

                if (pageNum === 1) {
                    setSuggestions(users || []);
                } else {
                    setSuggestions(prev => [...prev, ...(users || [])]);
                }
                setHasMoreSuggestions(users && users.length === 3);
            } catch (error) {
                console.error('Failed to load suggestions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions(1);

        // Listen for follow changes from other components (Profile page)
        const handleFollowChange = (e) => {
            const { userId, isFollowing } = e.detail;
            setSuggestions((prev) => prev.map((user) => (
                user.id === userId
                    ? { ...user, isFollowing }
                    : user
            )));
        };

        window.addEventListener('user-follow-state-change', handleFollowChange);
        return () => window.removeEventListener('user-follow-state-change', handleFollowChange);
    }, []);

    const fetchMoreSuggestions = async () => {
        if (!hasMoreSuggestions) return;
        const nextPage = suggestionsPage + 1;
        setSuggestionsPage(nextPage);
        try {
            const users = await UserService.getSuggestions(3, nextPage);
            setSuggestions(prev => [...prev, ...(users || [])]);
            setHasMoreSuggestions(users && users.length === 3);
        } catch (error) {
            console.error('Failed to load more suggestions', error);
        }
    };

    useEffect(() => {
        const fetchTrendingHashtags = async () => {
            try {
                // Weighted algorithm with 24h half-life over 7 days window
                const hashtags = await HashtagService.getTrendingHashtags(10, 7, 'weighted', 24);
                setTrendingHashtags(hashtags || []);
            } catch (error) {
                console.error('Failed to load trending hashtags', error);
            } finally {
                setLoadingHashtags(false);
            }
        };
        fetchTrendingHashtags();
    }, []);

    const handleFollow = async (userId) => {
        try {
            const res = await UserService.followUser(userId);
            const isFollowing = res.following;

            setSuggestions((prev) => prev.map((user) => (
                user.id === userId
                    ? { ...user, isFollowing }
                    : user
            )));

            window.dispatchEvent(new CustomEvent('user-follow-state-change', {
                detail: { userId, isFollowing }
            }));
        } catch (error) {
            console.error('Failed to follow user', error);
        }
    };

    return (
        <aside className="right-sidebar">
            {!isExplorePage && (
                <>
                    <SearchBox placeholder={t('right_sidebar.search', 'Rechercher')} />
                    <TrendsSection
                        t={t}
                        trendingHashtags={trendingHashtags}
                        loadingHashtags={loadingHashtags}
                    />
                </>
            )}

            <SuggestionsSection
                suggestions={suggestions}
                loading={loading}
                onFollow={handleFollow}
                t={t}
                loadMore={fetchMoreSuggestions}
                hasMore={hasMoreSuggestions}
            />
        </aside>
    );
};

export default RightSidebar;
