import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PostCard from '../components/PostCard';
import QuickReply from '../components/QuickReply';
import './css/Feed.css';

import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import usePostPage from '../hooks/usePostPage';
import { BASE_URL } from '../services/api';

const PostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { socket } = useSocket();
    const { user } = useAuth();

    const {
        post,
        loading
    } = usePostPage({ id, socket });

    const isOwnPost = post?.user?.id === user?.id;

    if (loading) return <div className="loading-spinner">{t('common.loading', 'Loading...')}</div>;
    if (!post) return <div className="not-found">{t('post.not_found', 'Post not found')}</div>;

    return (
        <div className="feed-container">
            <div className="feed-header sticky-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0 1rem', height: '53px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{t('post.title', 'Post')}</h2>
                </div>
            </div>

            <div className="post-detail-view">
                <PostCard post={post} isDetailView={true} />
            </div>

            <QuickReply
                parentPost={post}
                onReplySuccess={() => {
                    // Simple refresh for now. Optimistic updates would be better but require modifying the hook or state here.
                    // Effectively we can just reload the page or trigger a refetch if we exposed it.
                    // For simplicity, let's reload the window or navigate to same page to trigger hook re-run
                    window.location.reload();
                }}
            />

            <div className="replies-feed">
                {post.replies && post.replies.length > 0 ? (
                    post.replies.map(reply => (
                        <PostCard key={reply.id} post={reply} />
                    ))
                ) : (
                    <div className="no-replies">
                        {t('post.no_replies', 'No replies yet. Be the first!')}
                    </div>
                )}
            </div>


        </div>
    );
};

export default PostPage;
