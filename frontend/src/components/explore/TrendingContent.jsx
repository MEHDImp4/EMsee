import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import TrendingService from '../../services/trending.service';
import PostCard from '../PostCard';

const TrendingContent = ({ t }) => {
    const [posts, setPosts] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('posts'); // 'posts' or 'topics'

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                setLoading(true);
                const [postsData, topicsData] = await Promise.all([
                    TrendingService.getTrendingPosts(10, 3), // Last 3 days
                    TrendingService.getTrendingTopics(5, 7)  // Last 7 days
                ]);
                setPosts(postsData?.data || []);
                setTopics(topicsData?.data || []);
            } catch (error) {
                console.error('Failed to fetch trending content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                {t('common.loading', 'Chargement...')}
            </div>
        );
    }

    return (
        <div>
            {/* View Toggle */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '1rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-primary)'
            }}>
                <button
                    onClick={() => setActiveView('posts')}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: activeView === 'posts' ? '1px solid var(--primary-color, #1DA1F2)' : '1px solid var(--border)',
                        borderRadius: '6px',
                        background: activeView === 'posts' ? 'rgba(29, 161, 242, 0.1)' : 'transparent',
                        color: activeView === 'posts' ? 'var(--primary-color, #1DA1F2)' : 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <TrendingUp size={18} />
                    {t('trending.hot_posts', 'Posts tendance')}
                </button>
                <button
                    onClick={() => setActiveView('topics')}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: activeView === 'topics' ? '1px solid var(--primary-color, #1DA1F2)' : '1px solid var(--border)',
                        borderRadius: '6px',
                        background: activeView === 'topics' ? 'rgba(29, 161, 242, 0.1)' : 'transparent',
                        color: activeView === 'topics' ? 'var(--primary-color, #1DA1F2)' : 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <TrendingUp size={18} />
                    {t('trending.hot_topics', 'Sujets tendance')}
                </button>
            </div>

            {/* Posts View */}
            {activeView === 'posts' && (
                <div>
                    {posts.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            {t('trending.no_posts', 'Aucun post tendance pour le moment')}
                        </div>
                    ) : (
                        posts.map((post, index) => (
                            <div key={post.id}>
                                <PostCard post={post} />
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Topics View */}
            {activeView === 'topics' && (
                <div>
                    {topics.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            {t('trending.no_topics', 'Aucun sujet tendance pour le moment')}
                        </div>
                    ) : (
                        <div style={{ padding: '1rem' }}>
                            <h3 style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: 800, 
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <TrendingUp size={24} style={{ color: 'var(--text-secondary)' }} />
                                {t('trending.most_engaged', 'Sujets les plus engageants')}
                            </h3>
                            {topics.map((topic, index) => (
                                <div
                                    key={topic.name}
                                    style={{
                                        padding: '1rem',
                                        marginBottom: '0.75rem',
                                        background: 'transparent',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--hover-bg, rgba(0,0,0,0.05))';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                    onClick={() => window.location.href = `/explore?q=%23${topic.name}`}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.5rem',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <span style={{
                                                    background: 'transparent',
                                                    border: '1px solid var(--border)',
                                                    color: 'var(--text-secondary)',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    #{index + 1}
                                                </span>
                                                <span style={{ 
                                                    fontSize: '1.125rem', 
                                                    fontWeight: 700,
                                                    color: 'var(--primary-color, #1DA1F2)'
                                                }}>
                                                    #{topic.name}
                                                </span>
                                            </div>
                                            <div style={{ 
                                                fontSize: '0.875rem', 
                                                color: 'var(--text-muted)',
                                                marginBottom: '0.5rem'
                                            }}>
                                                {topic.postCount} {t('hashtags.posts', 'posts')}
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                gap: '1rem',
                                                fontSize: '0.8125rem',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.7rem' }}>♥</span> {topic.totalLikes.toLocaleString()}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.7rem' }}>↻</span> {topic.totalReposts.toLocaleString()}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.7rem' }}>💬</span> {topic.totalComments.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <TrendingUp 
                                            size={20} 
                                            style={{ 
                                                color: 'var(--text-muted)',
                                                opacity: 0.5,
                                                marginLeft: '1rem'
                                            }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrendingContent;
