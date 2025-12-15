import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HashtagService from '../services/hashtag.service';
import PostCard from '../components/PostCard';
import PageLoader from '../components/loaders/PageLoader';
import './css/HashtagPage.css';

const HashtagPage = () => {
    const { name } = useParams();
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPosts, setTotalPosts] = useState(0);

    useEffect(() => {
        loadPosts(1);
    }, [name]);

    const loadPosts = async (pageNum) => {
        try {
            setLoading(true);
            const response = await HashtagService.getPostsByHashtag(name, pageNum, 20);
            
            if (pageNum === 1) {
                setPosts(response.data);
            } else {
                setPosts(prev => [...prev, ...response.data]);
            }
            
            setTotalPosts(response.meta.total);
            setHasMore(pageNum < response.meta.totalPages);
            setPage(pageNum);
            setError(null);
        } catch (err) {
            console.error('Error loading hashtag posts:', err);
            setError(err.message || t('hashtags.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadPosts(page + 1);
        }
    };

    if (loading && page === 1) {
        return <PageLoader />;
    }

    if (error && page === 1) {
        return (
            <div className="hashtag-page">
                <div className="error-message">
                    <h2>{t('hashtags.error')}</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="hashtag-page">
            <div className="hashtag-header">
                <h1>#{name}</h1>
                <p className="hashtag-stats">
                    {totalPosts} {t('hashtags.posts_count')}
                </p>
            </div>

            <div className="hashtag-content">
                {posts.length === 0 && !loading ? (
                    <div className="no-posts">
                        <p>{t('hashtags.no_posts')}</p>
                    </div>
                ) : (
                    <>
                        <div className="posts-list">
                            {posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="load-more-container">
                                <button 
                                    onClick={handleLoadMore} 
                                    disabled={loading}
                                    className="load-more-btn"
                                >
                                    {loading ? t('common.loading') : t('common.load_more')}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HashtagPage;
