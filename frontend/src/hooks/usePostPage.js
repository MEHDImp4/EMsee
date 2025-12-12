import { useEffect, useRef, useState } from 'react';
import PostService from '../services/post.service';

const usePostPage = ({ id, socket }) => {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const replyRef = useRef(null);
    const commentIdsRef = useRef(new Set());

    const commentExists = (commentId) => commentIdsRef.current.has(commentId);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                const [postData, commentsData] = await Promise.all([
                    PostService.getPostById(id),
                    PostService.getComments(id)
                ]);

                setPost(postData);
                const safeComments = commentsData || [];
                setComments(safeComments);
                commentIdsRef.current = new Set(safeComments.map((c) => c.id));
            } catch (error) {
                console.error('Failed to load post', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPostAndComments();
    }, [id]);

    useEffect(() => {
        if (!socket) return;

        const handleNewComment = (newComment) => {
            if (newComment.postId === parseInt(id, 10) && !commentExists(newComment.id)) {
                commentIdsRef.current.add(newComment.id);
                setComments((prev) => [...prev, newComment]);
                setPost((prev) => prev ? {
                    ...prev,
                    _count: {
                        ...prev._count,
                        comments: (prev._count?.comments || 0) + 1
                    }
                } : prev);
            }
        };

        socket.on('new_comment', handleNewComment);
        return () => socket.off('new_comment', handleNewComment);
    }, [socket, id]);

    const handleCommentAdded = (newComment) => {
        if (commentExists(newComment.id)) return;
        commentIdsRef.current.add(newComment.id);
        setComments((prev) => [...prev, newComment]);
        setPost((prev) => prev ? {
            ...prev,
            _count: {
                ...prev._count,
                comments: (prev._count?.comments || 0) + 1
            }
        } : prev);
    };

    const handleSubmitReply = async () => {
        if (!replyText.trim() || !post?.id || submitting) return;
        try {
            setSubmitting(true);
            const newComment = await PostService.commentPost(post.id, replyText.trim());
            setReplyText('');
            handleCommentAdded(newComment);
            if (replyRef.current) replyRef.current.focus();
        } catch (error) {
            console.error('Failed to add comment', error);
        } finally {
            setSubmitting(false);
        }
    };

    const focusReplyBox = () => {
        if (replyRef.current) {
            replyRef.current.focus();
            replyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return {
        post,
        comments,
        loading,
        replyText,
        setReplyText,
        submitting,
        replyRef,
        handleSubmitReply,
        focusReplyBox
    };
};

export default usePostPage;
