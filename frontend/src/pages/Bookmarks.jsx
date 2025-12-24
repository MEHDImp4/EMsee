
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import PostCard from '../components/PostCard';
import PostService from '../services/post.service';
import PageLoader from '../components/loaders/PageLoader';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Bookmarks = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchBookmarks = async (pageNum = 1) => { // Default to 1 if not provided, but we should use the argument
        if (loading && pageNum !== 1) return; // Prevent concurrent pagination loads, but allow initial load

        try {
            const response = await PostService.getBookmarks(pageNum, 20);
            const newPosts = response?.data || [];

            if (newPosts.length === 0) {
                setHasMore(false);
            } else {
                setPosts(prev => pageNum === 1 ? newPosts : [...prev, ...newPosts]);
                setPage(pageNum + 1);
            }
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks(1);
    }, []);

    const handleDeletePost = (postId) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    if (loading && page === 1) return <PageLoader />;

    return (
        <div className="feed-container">
            <div className="feed-header sticky-header">
                <div style={{ padding: '0 1rem', height: '53px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate(-1)} className="ghost-icon-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>
                            {t('sidebar.bookmarks', 'Signets')}
                        </h2>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            @{user?.username}
                        </div>
                    </div>
                </div>
            </div>

            <div className="posts-list">
                {posts.length === 0 && !loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p>{t('bookmarks.empty', "Vous n'avez aucun signet pour le moment.")}</p>
                    </div>
                ) : (
                    <>
                        {posts.map((post, index) => (
                            <PostCard
                                key={`${post.id}-${index}`}
                                post={post}
                                onDelete={handleDeletePost}
                            />
                        ))}

                        {hasMore && (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <button
                                    className="ghost-icon-btn"
                                    style={{ width: 'auto', padding: '10px 20px', borderRadius: '20px', fontSize: '0.9rem' }}
                                    onClick={() => fetchBookmarks(page)}
                                    disabled={loading}
                                >
                                    {loading ? 'Chargement...' : 'Voir plus'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Bookmarks;
