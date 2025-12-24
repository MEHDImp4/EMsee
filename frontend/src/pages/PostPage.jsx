import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PostCard from '../components/PostCard';
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

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (!post) return <div className="not-found">Post not found</div>;

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
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Post</h2>
                </div>
            </div>

            <div className="post-detail-view">
                <PostCard post={post} isDetailView={true} />
            </div>


        </div>
    );
};

export default PostPage;
