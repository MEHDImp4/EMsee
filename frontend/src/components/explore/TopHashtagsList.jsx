import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Hash, MoreHorizontal } from 'lucide-react';
import HashtagService from '../../services/hashtag.service';

const TopHashtagsList = ({ t }) => {
    const [hashtags, setHashtags] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopHashtags = async () => {
            try {
                setLoading(true);
                const data = await HashtagService.getTopHashtags(10);
                setHashtags(data || []);
            } catch (error) {
                console.error('Failed to fetch top hashtags:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopHashtags();
    }, []);

    const handleHashtagClick = (hashtagName) => {
        navigate(`/explore?q=%23${hashtagName}`);
    };

    if (loading) {
        return (
            <div className="trends-list">
                <h3 style={{ padding: '1rem 1rem 0.5rem 1rem', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {t('hashtags.top_hashtags', 'Top Hashtags')}
                </h3>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('common.loading', 'Chargement...')}
                </div>
            </div>
        );
    }

    if (hashtags.length === 0) {
        return (
            <div className="trends-list">
                <h3 style={{ padding: '1rem 1rem 0.5rem 1rem', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {t('hashtags.top_hashtags', 'Top Hashtags')}
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
                {t('hashtags.top_hashtags', 'Top Hashtags')}
            </h3>
            {hashtags.map((hashtag, index) => (
                <div
                    key={hashtag.name}
                    className="trend-item"
                    onClick={() => handleHashtagClick(hashtag.name)}
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
                        <div style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--text-muted)', 
                            marginBottom: '0.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                        }}>
                            <Hash size={14} />
                            <span>#{index + 1} · {t('hashtags.trending', 'Tendance')}</span>
                        </div>
                        <div style={{ 
                            fontSize: '1rem', 
                            fontWeight: 700, 
                            color: 'var(--primary-color, #1DA1F2)', 
                            marginBottom: '0.2rem' 
                        }}>
                            #{hashtag.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {hashtag.totalCount.toLocaleString()} {t('hashtags.posts', 'posts')}
                        </div>
                    </div>
                    <button 
                        className="more-btn" 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg, rgba(0,0,0,0.1))'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TopHashtagsList;
