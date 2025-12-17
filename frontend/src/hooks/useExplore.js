import { useEffect, useMemo, useState } from 'react';
import UserService from '../services/user.service';
import HashtagService from '../services/hashtag.service';

const useExplore = (initialQuery = '') => {
    const [activeTab, setActiveTab] = useState(
        initialQuery.startsWith('#') ? 'hashtags' : (initialQuery.startsWith('@') ? 'users' : 'foryou')
    );
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hashtagPosts, setHashtagPosts] = useState([]);
    const [hashtagMeta, setHashtagMeta] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery.trim());
            } else {
                setSearchResults([]);
                setHashtagPosts([]);
                setHashtagMeta(null);
                setActiveTab('foryou');
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const handleSearch = async (query) => {
        const q = query || searchQuery;
        setIsSearching(true);
        try {
            if (q.startsWith('#')) {
                const tag = q.replace(/^#/, '');
                const response = await HashtagService.getPostsByHashtag(tag, 1, 50);
                setHashtagPosts(response?.data || []);
                setHashtagMeta(response?.meta || null);
                setActiveTab('hashtags');
            } else {
                const normalized = q.startsWith('@') ? q.replace(/^@/, '') : q;
                const results = await UserService.searchUsers(normalized);
                setSearchResults(results || []);
                setActiveTab('users');
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsSearching(false);
        }
    };

    const tabs = useMemo(() => ([
        { id: 'foryou', labelKey: 'explore.tabs.foryou', fallback: 'Pour vous' },
        { id: 'users', labelKey: 'explore.tabs.users', fallback: 'Utilisateurs' },
        { id: 'hashtags', labelKey: 'explore.tabs.hashtags', fallback: 'Hashtags' },
        { id: 'trending', labelKey: 'explore.tabs.trending', fallback: 'Tendances' }
    ]), []);

    return {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        handleSearch,
        hashtagPosts,
        hashtagMeta,
        tabs
    };
};

export default useExplore;
