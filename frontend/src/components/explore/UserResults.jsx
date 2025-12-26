import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from '../UserAvatar';

const UserResults = ({ results, searchQuery, isSearching, loadMore, hasMore, loadingMore, t }) => {
    const observerTarget = useRef(null);

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

    // Determine loading state for initial load (when results are empty and searching)
    const initialLoading = isSearching && results.length === 0;

    if (initialLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('explore.searching', 'Recherche en cours...')}</div>;
    }

    if (results.length > 0) {
        return (
            <div className="users-list">
                {!searchQuery && (
                    <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--border)',
                        fontWeight: 600,
                        fontSize: '1.125rem'
                    }}>
                        {t('explore.recent_users', 'Nouveaux utilisateurs')}
                    </div>
                )}
                {results.map((user) => (
                    <Link to={`/profile/${user.username}`} key={user.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ padding: '1rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                            <UserAvatar user={user} size={40} className="avatar-circle" />
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{user.full_name || user.username}</div>
                                <div style={{ color: 'var(--text-muted)' }}>@{user.username}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t(`auth.${(user.role || 'student').toLowerCase()}`)}</div>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* Loader for infinite scroll */}
                <div ref={observerTarget} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {(loadingMore) && t('common.loading', 'Chargement...')}
                    {!hasMore && results.length > 0 && (
                        <span style={{ fontSize: '0.9rem' }}>{t('explore.no_more_results', 'Fin des résultats')}</span>
                    )}
                </div>
            </div>
        );
    }

    if (searchQuery) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('explore.no_results', `Aucun utilisateur trouvé pour "${searchQuery}"`)}</div>;
    }

    return null; // Should not reach here typically given parent logic
};

export default UserResults;
