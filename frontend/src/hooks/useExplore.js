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
    const [topHashtags, setTopHashtags] = useState([]);

    // Pagination state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                setPage(1);
                handleSearch(searchQuery.trim(), 1);
            } else {
                // If query cleared, reset state and fetch default content based on tab
                setSearchResults([]);
                setHashtagPosts([]);
                setHashtagMeta(null);
                setTopHashtags([]);
                setPage(1);
                setHasMore(true);

                if (activeTab === 'users') {
                    fetchRecentUsers(1);
                } else if (activeTab === 'hashtags') {
                    fetchTopHashtags(1);
                }
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, activeTab]); // Added activeTab to dependency to trigger refetch when switching tabs with empty query

    const fetchRecentUsers = async (pageNum) => {
        setIsSearching(true);
        setLoadingMore(pageNum > 1);
        try {
            const data = await UserService.getRecentUsers(10, pageNum);
            if (pageNum === 1) {
                setSearchResults(data || []);
            } else {
                setSearchResults(prev => [...prev, ...(data || [])]);
            }
            setHasMore(data && data.length === 10);
        } catch (error) {
            console.error('Failed to fetch recent users:', error);
        } finally {
            setIsSearching(false);
            setLoadingMore(false);
        }
    };

    const fetchTopHashtags = async (pageNum) => {
        setIsSearching(true);
        setLoadingMore(pageNum > 1);
        try {
            const data = await HashtagService.getTopHashtags(10, pageNum);
            if (pageNum === 1) {
                setTopHashtags(data || []);
            } else {
                setTopHashtags(prev => [...prev, ...(data || [])]);
            }
            // If data < limit, no more
            setHasMore(data && data.length === 10);
        } catch (error) {
            console.error('Failed to fetch top hashtags:', error);
            setTopHashtags([]);
        } finally {
            setIsSearching(false);
            setLoadingMore(false);
        }
    };

    const handleSearch = async (query, pageNum = 1) => {
        const q = query || searchQuery;
        setIsSearching(pageNum === 1);
        setLoadingMore(pageNum > 1);

        try {
            if (q.startsWith('#')) {
                const tag = q.replace(/^#/, '');
                const response = await HashtagService.getPostsByHashtag(tag, pageNum, 20); // Limit 20 (or 50 per old code, sticking to 20 for scrolling)

                if (pageNum === 1) {
                    setHashtagPosts(response?.data || []);
                } else {
                    setHashtagPosts(prev => [...prev, ...(response?.data || [])]);
                }
                setHashtagMeta(response?.meta || null);

                // Determine hasMore from meta
                const totalPages = response?.meta?.totalPages || 0;
                setHasMore(pageNum < totalPages);

                if (pageNum === 1 && activeTab !== 'hashtags') setActiveTab('hashtags');
            } else {
                const normalized = q.startsWith('@') ? q.replace(/^@/, '') : q;
                const results = await UserService.searchUsers(normalized, pageNum, 10);

                if (pageNum === 1) {
                    setSearchResults(results || []);
                } else {
                    setSearchResults(prev => [...prev, ...(results || [])]);
                }
                setHasMore(results && results.length === 10);

                if (pageNum === 1 && activeTab !== 'users') setActiveTab('users');
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsSearching(false);
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        if (!hasMore || loadingMore || isSearching) return;

        const nextPage = page + 1;
        setPage(nextPage);

        if (searchQuery.trim()) {
            handleSearch(searchQuery, nextPage);
        } else {
            if (activeTab === 'users') {
                fetchRecentUsers(nextPage);
            } else if (activeTab === 'hashtags') {
                fetchTopHashtags(nextPage);
            }
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
        tabs,
        loadMore,
        hasMore,
        loadingMore,
        topHashtags
    };
};

export default useExplore;
