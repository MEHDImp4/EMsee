import React, { useEffect } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useExplore from '../hooks/useExplore';
import TrendsList from '../components/explore/TrendsList';
import TopHashtagsList from '../components/explore/TopHashtagsList';
import TrendingContent from '../components/explore/TrendingContent';
import UserResults from '../components/explore/UserResults';
import HashtagResults from '../components/explore/HashtagResults';

const Explore = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        tabs,
        hashtagPosts,
        handleSearch
    } = useExplore(initialQuery);

    useEffect(() => {
        if (initialQuery && initialQuery !== searchQuery) {
            setSearchQuery(initialQuery);
            handleSearch(initialQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuery]);

    const updateQueryParam = (value) => {
        const next = value || '';
        setSearchQuery(next);

        // Instant tab switch by prefix
        if (next.startsWith('#')) {
            setActiveTab('hashtags');
        } else if (next.startsWith('@')) {
            setActiveTab('users');
        } else if (!next) {
            setActiveTab('foryou');
        }

        const params = new URLSearchParams(searchParams);
        if (next) params.set('q', next); else params.delete('q');
        setSearchParams(params, { replace: true });
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        // Clear search when switching to For You or Trending
        if (tabId === 'foryou' || tabId === 'trending') {
            setSearchQuery('');
            const params = new URLSearchParams(searchParams);
            params.delete('q');
            setSearchParams(params, { replace: true });
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
                        onChange={(e) => updateQueryParam(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="feed-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab.id)}
                    >
                        {t(tab.labelKey, tab.fallback)}
                        {activeTab === tab.id && <div className="tab-indicator" />}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ paddingBottom: '2rem' }}>
                {activeTab === 'foryou' && !searchQuery && <TrendsList t={t} />}

                {activeTab === 'trending' && !searchQuery && <TrendingContent t={t} />}

                {(activeTab === 'users' || (searchQuery && !searchQuery.startsWith('#'))) && (
                    <UserResults
                        results={searchResults}
                        searchQuery={searchQuery}
                        isSearching={isSearching}
                        t={t}
                    />
                )}

                {activeTab === 'hashtags' && !searchQuery && <TopHashtagsList t={t} />}

                {activeTab === 'hashtags' && searchQuery.startsWith('#') && (
                    <HashtagResults
                        posts={hashtagPosts}
                        searchQuery={searchQuery}
                        isSearching={isSearching}
                        t={t}
                    />
                )}
            </div>
        </div>
    );
};

export default Explore;
