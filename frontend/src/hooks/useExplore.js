import { useEffect, useMemo, useState } from 'react';
import UserService from '../services/user.service';

const useExplore = () => {
    const [activeTab, setActiveTab] = useState('foryou');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
                setActiveTab('users');
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const results = await UserService.searchUsers(searchQuery);
            setSearchResults(results || []);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsSearching(false);
        }
    };

    const tabs = useMemo(() => ([
        { id: 'foryou', labelKey: 'explore.tabs.foryou', fallback: 'Pour vous' },
        { id: 'users', labelKey: 'explore.tabs.users', fallback: 'Utilisateurs' },
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
        tabs
    };
};

export default useExplore;
