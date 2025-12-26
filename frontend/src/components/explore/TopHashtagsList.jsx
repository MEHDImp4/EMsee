import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, MoreHorizontal } from 'lucide-react';

const TopHashtagsList = ({ t, hashtags, loadMore, hasMore, loadingMore, isSearching }) => {
    const observerTarget = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !isSearching) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loadingMore, isSearching, loadMore]);

    const handleHashtagClick = (hashtagName) => {
        navigate(`/explore?q=%23${hashtagName}`);
    };

    // Initial Loading State (searching or fetching first page)
    const initialLoading = isSearching && (!hashtags || hashtags.length === 0);

    if (initialLoading) {
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

    if (!hashtags || hashtags.length === 0) {
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
                    key={`${hashtag.name}-${index}`}
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

            {/* Loader for infinite scroll */}
            <div ref={observerTarget} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                {(loadingMore) && t('common.loading', 'Chargement...')}
                {!hasMore && hashtags.length > 0 && (
                    <span style={{ fontSize: '0.9rem' }}>{t('explore.no_more_results', 'Fin des résultats')}</span>
                )}
            </div>
        </div>
    );
};

export default TopHashtagsList;
