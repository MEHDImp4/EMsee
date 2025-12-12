import React from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../services/api';

const UserResults = ({ results, searchQuery, isSearching, t }) => {
    if (isSearching) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('explore.searching', 'Recherche en cours...')}</div>;
    }

    if (results.length > 0) {
        return (
            <div className="users-list">
                {results.map((user) => (
                    <Link to={`/profile/${user.username}`} key={user.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ padding: '1rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                            <div className="avatar-circle" style={{ width: 40, height: 40, overflow: 'hidden' }}>
                                {user.avatar ? (
                                    <img src={`${BASE_URL}${user.avatar}`} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    (user.full_name || user.username).charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{user.full_name || user.username}</div>
                                <div style={{ color: 'var(--text-muted)' }}>@{user.username}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t(`auth.${user.role || 'student'}`)}</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    }

    if (searchQuery) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('explore.no_results', `Aucun utilisateur trouvé pour "${searchQuery}"`)}</div>;
    }

    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('explore.search_hint', 'Utilisez la barre de recherche pour trouver des personnes.')}</div>;
};

export default UserResults;
