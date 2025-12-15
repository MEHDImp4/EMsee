import React from 'react';
import PostCard from '../PostCard';

const HashtagResults = ({ posts, searchQuery, isSearching, t }) => {
    if (isSearching) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('explore.searching', 'Recherche en cours...')}</div>;
    }

    if (posts && posts.length > 0) {
        return (
            <div className="posts-list">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        );
    }

    if (searchQuery) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('explore.no_results', `Aucun résultat pour "${searchQuery}"`)}</div>;
    }

    return null;
};

export default HashtagResults;
