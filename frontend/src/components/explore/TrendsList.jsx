import React, { useEffect, useState } from 'react';
import { MoreHorizontal, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ForYouService from '../../services/foryou.service';

const TrendsList = ({ t }) => {
    const navigate = useNavigate();
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForYou = async () => {
            try {
                const data = await ForYouService.getForYouHashtags(10, 30);
                setTrends(data || []);
            } catch (error) {
                console.error('Failed to load For You hashtags', error);
                setTrends([]);
            } finally {
                setLoading(false);
            }
        };
        fetchForYou();
    }, []);

    const getCategoryLabel = (category) => {
        const labels = {
            your_activity: t('explore.category.your_activity', 'Votre activité'),
            following: t('explore.category.following', 'Personnes suivies'),
            your_class: t('explore.category.your_class', 'Votre classe'),
            trending: t('explore.category.trending', 'Tendances'),
            popular: t('explore.category.popular', 'Populaire')
        };
        return labels[category] || labels.popular;
    };

    const handleHashtagClick = (name) => {
        navigate(`/explore?q=${encodeURIComponent('#' + name)}`);
    };

    if (loading) {
        return (
            <div className="trends-list">
                <h3 style={{ padding: '1rem 1rem 0.5rem 1rem', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {t('explore.for_you', 'Pour vous')}
                </h3>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('common.loading', 'Loading...')}
                </div>
            </div>
        );
    }

    if (trends.length === 0) {
        return (
            <div className="trends-list">
                <h3 style={{ padding: '1rem 1rem 0.5rem 1rem', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {t('explore.for_you', 'Pour vous')}
                </h3>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('explore.no_trends', 'Aucune tendance pour le moment')}
                </div>
            </div>
        );
    }

    return (
        <div className="trends-list">
            <h3 style={{ padding: '1rem 1rem 0.5rem 1rem', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {t('explore.for_you', 'Pour vous')}
            </h3>
            {trends.map((trend, index) => (
                <div
                    key={trend.name + index}
                    className="trend-item"
                    onClick={() => handleHashtagClick(trend.name)}
                    style={{
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg, rgba(0,0,0,0.05))'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <TrendingUp size={14} />
                            {getCategoryLabel(trend.category)}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-color, #1DA1F2)', marginBottom: '0.2rem' }}>
                            #{trend.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {trend.totalCount} {t('hashtags.posts_count', 'posts')}
                        </div>
                    </div>
                    <button className="more-btn" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TrendsList;
