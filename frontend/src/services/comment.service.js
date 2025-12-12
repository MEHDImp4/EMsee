import api from './api';

const CommentService = {
    likeComment: async (commentId) => {
        const response = await api.post(`/comments/${commentId}/like`);
        return response;
    },
    repostComment: async (commentId) => {
        const response = await api.post(`/comments/${commentId}/repost`);
        return response;
    },
    saveComment: async (commentId) => {
        const response = await api.post(`/comments/${commentId}/save`);
        return response;
    },
    replyToComment: async (commentId, content) => {
        const response = await api.post(`/comments/${commentId}/reply`, { content });
        return response;
    },
    getCommentReplies: async (commentId) => {
        const response = await api.get(`/comments/${commentId}/replies`);
        return response;
    },
    getCommentPath: async (commentId) => {
        const response = await api.get(`/posts/comments/${commentId}/path`);
        return response;
    }
};

export default CommentService;
