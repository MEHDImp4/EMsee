import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useExplore from '../hooks/useExplore';
import TrendsList from '../components/explore/TrendsList';
import UserResults from '../components/explore/UserResults';

const Explore = () => {
    const { t } = useTranslation();
    const {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        tabs
    } = useExplore();

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
                {activeTab === 'foryou' && !searchQuery && <TrendsList t={t} />}

                {(activeTab === 'users' || searchQuery) && (
                    <UserResults
                        results={searchResults}
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
