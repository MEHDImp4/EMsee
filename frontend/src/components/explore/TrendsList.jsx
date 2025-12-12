import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { TRENDS } from '../../hooks/useExplore';

const TrendsList = ({ t }) => (
    <div className="trends-list">
        <h3 style={{ padding: '1rem', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
            {t('explore.trends_for_you', 'Tendances pour vous')}
        </h3>
        {TRENDS.map((trend, index) => (
            <div
                key={trend.name + index}
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
                        {t(trend.categoryKey, trend.fallbackCategory)}
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
);

export default TrendsList;
