import api from './api';

const CommunityService = {
    getCommunities: async (tab) => {
        const response = await api.get(`/communities?tab=${tab}`);
        return response;
    },

    getCommunity: async (id) => {
        const response = await api.get(`/communities/${id}`);
        return response;
    },

    createCommunity: async (data) => {
        const response = await api.post('/communities', data);
        return response;
    },

    joinCommunity: async (id) => {
        const response = await api.post(`/communities/${id}/join`);
        return response;
    },

    leaveCommunity: async (id) => {
        const response = await api.delete(`/communities/${id}/leave`);
        return response;
    },

    updateCommunity: async (id, data) => {
        const response = await api.put(`/communities/${id}`, data);
        return response;
    },

    deleteCommunity: async (id) => {
        const response = await api.delete(`/communities/${id}`);
        return response;
    },

    // Admin
    getMembers: async (id, status) => {
        const response = await api.get(`/communities/${id}/members?status=${status || ''}`);
        return response;
    },

    manageMember: async (id, userId, action) => {
        const response = await api.put(`/communities/${id}/members/${userId}`, { action });
        return response;
    },

    // Messages
    getMessages: async (id, cursor) => {
        const response = await api.get(`/communities/${id}/messages?cursor=${cursor || ''}`);
        return response;
    },

    sendMessage: async (id, content, mediaUrl, mediaType) => {
        const response = await api.post(`/communities/${id}/messages`, { content, mediaUrl, mediaType });
        return response;
    },

    toggleReaction: async (id, messageId, emoji) => {
        const response = await api.post(`/communities/${id}/messages/${messageId}/react`, { emoji });
        return response;
    }
};

export default CommunityService;
