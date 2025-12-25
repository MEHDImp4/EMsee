import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../services/api';
import UserService from '../../services/user.service';
import UserAvatar from '../UserAvatar';

const UserResults = ({ results, searchQuery, isSearching, t }) => {
    const [recentUsers, setRecentUsers] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(false);

    useEffect(() => {
        // Fetch recent users when no search query
        if (!searchQuery) {
            const fetchRecent = async () => {
                try {
                    setLoadingRecent(true);
                    const data = await UserService.getRecentUsers(10);
                    setRecentUsers(data || []);
                } catch (error) {
                    console.error('Failed to fetch recent users:', error);
                } finally {
                    setLoadingRecent(false);
                }
            };
            fetchRecent();
        }
    }, [searchQuery]);

    const displayUsers = searchQuery ? results : recentUsers;
    const loading = searchQuery ? isSearching : loadingRecent;

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('explore.searching', 'Recherche en cours...')}</div>;
    }

    if (displayUsers.length > 0) {
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
                {displayUsers.map((user) => (
                    <Link to={`/profile/${user.username}`} key={user.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ padding: '1rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                            <UserAvatar user={user} size={40} className="avatar-circle" />
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
