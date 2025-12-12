import { useEffect, useRef, useState } from 'react';
import CommentService from '../services/comment.service';
import { API_URL } from '../services/api';

const useCommentPage = ({ id, socket }) => {
    const [comment, setComment] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [breadcrumbData, setBreadcrumbData] = useState({ post: null, path: [] });
    const replyTextareaRef = useRef(null);
    const replyIdsRef = useRef(new Set());

    useEffect(() => {
        const loadComment = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/posts/comments/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to load comment');
                }

                const data = await response.json();
                setComment(data);

                const repliesData = await CommentService.getCommentReplies(id);
                setReplies(repliesData || []);
                repliesData?.forEach((r) => replyIdsRef.current.add(r.id));

                try {
                    const pathData = await CommentService.getCommentPath(id);
                    setBreadcrumbData({ post: pathData.post, path: pathData.path || [] });
                } catch (pathError) {
                    console.error('Error loading breadcrumb path:', pathError);
                }
            } catch (err) {
                console.error('Error loading comment:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadComment();
    }, [id]);

    useEffect(() => {
        if (!socket) return;

        const handleCommentAdded = (newReply) => {
            if (newReply.parentCommentId === parseInt(id, 10) && !replyIdsRef.current.has(newReply.id)) {
                setReplies((prev) => [newReply, ...prev]);
                replyIdsRef.current.add(newReply.id);
            }
        };

        socket.on('comment_added', handleCommentAdded);
        return () => socket.off('comment_added', handleCommentAdded);
    }, [socket, id]);

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return;

        try {
            setIsSubmitting(true);
            const newReply = await CommentService.replyToComment(id, replyText);

            if (newReply && !replyIdsRef.current.has(newReply.id)) {
                setReplies((prev) => [newReply, ...prev]);
                replyIdsRef.current.add(newReply.id);
            }

            setReplyText('');
            if (replyTextareaRef.current) {
                replyTextareaRef.current.blur();
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        comment,
        replies,
        loading,
        error,
        replyText,
        setReplyText,
        isSubmitting,
        breadcrumbData,
        replyTextareaRef,
        handleReplySubmit
    };
};

export default useCommentPage;
