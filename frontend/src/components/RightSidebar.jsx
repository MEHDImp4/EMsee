import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MoreHorizontal } from 'lucide-react';

const RightSidebar = () => {
    const { t } = useTranslation();
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
                    <div className="trend-meta">Tendances • Maroc</div>
                    <div className="trend-name">#SaharaMarocain</div>
                    <div className="trend-count">12.5k posts</div>
                    <button className="more-btn"><MoreHorizontal size={16} /></button>
                </div>

                <div className="trend-item">
                    <div className="trend-meta">Éducation • Tendance</div>
                    <div className="trend-name">PFE 2025</div>
                    <div className="trend-count">4,203 posts</div>
                    <button className="more-btn"><MoreHorizontal size={16} /></button>
                </div>

                <div className="trend-item">
                    <div className="trend-meta">Technologie • Tendance</div>
                    <div className="trend-name">React & Tailwind</div>
                    <div className="trend-count">1,502 posts</div>
                    <button className="more-btn"><MoreHorizontal size={16} /></button>
                </div>

                <div className="show-more">{t('right_sidebar.show_more', 'Voir plus')}</div>
            </div>

            <div className="sidebar-card suggestions-card">
                <h3>{t('right_sidebar.suggestions', 'Suggestions')}</h3>
                {/* Mock Suggestions */}
                {[1, 2].map(i => (
                    <div key={i} className="suggestion-item">
                        <div className="suggestion-avatar" />
                        <div className="suggestion-info">
                            <div className="suggestion-name">Utilisateur {i}</div>
                            <div className="suggestion-handle">@user{i}</div>
                        </div>
                        <button className="btn-follow">{t('right_sidebar.follow', 'Suivre')}</button>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default RightSidebar;
