import React, { useState } from 'react';
import { Search, MoreHorizontal, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Explore = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('foryou');

    const tabs = [
        { id: 'foryou', label: t('explore.tabs.foryou', 'Pour vous') },
        { id: 'trending', label: t('explore.tabs.trending', 'Tendances') },
        { id: 'clubs', label: t('explore.tabs.clubs', 'Clubs') },
        { id: 'events', label: t('explore.tabs.events', 'Événements') },
    ];

    const trends = [
        { category: 'Tendances • Maroc', name: '#SaharaMarocain', posts: '12.5k posts' },
        { category: 'Éducation • Tendance', name: 'PFE 2025', posts: '4,203 posts' },
        { category: 'Technologie • Tendance', name: 'React & Tailwind', posts: '1,502 posts' },
        { category: 'Campus', name: 'Hackathon EMSI', posts: '856 posts' },
        { category: 'Sport', name: 'EMSI Foot League', posts: '340 posts' },
    ];

    return (
        <div className="main-content" style={{ flex: 1, borderRight: '1px solid var(--border)' }}>
            {/* Search Header */}
            <div className="feed-header" style={{ padding: '0.5rem 1rem' }}>
                <div className="search-bar" style={{ width: '100%' }}>
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t('explore.search_placeholder', 'Rechercher sur EMsee')}
                        className="search-input"
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
                {activeTab === 'foryou' && (
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
                
                {activeTab !== 'foryou' && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p>{t('explore.coming_soon', 'Contenu à venir...')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;
