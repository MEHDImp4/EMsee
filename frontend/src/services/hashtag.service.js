import api from './api';

/**
 * Get top hashtags by total post count
 */
export const getTopHashtags = (limit = 10, page = 1) => {
    return api.get(`/hashtags/top?limit=${limit}&page=${page}`);
};

/**
 * Get trending hashtags
 */
export const getTrendingHashtags = (limit = 10, days = 7, algorithm = 'weighted', halfLifeHours = 24) => {
    return api.get(`/hashtags/trending?limit=${limit}&days=${days}&algorithm=${encodeURIComponent(algorithm)}&halfLifeHours=${halfLifeHours}`);
};

/**
 * Search hashtags by name
 */
export const searchHashtags = (query, limit = 10) => {
    return api.get(`/hashtags/search?q=${encodeURIComponent(query)}&limit=${limit}`);
};

/**
 * Get posts by hashtag with pagination
 */
export const getPostsByHashtag = (name, page = 1, limit = 20) => {
    return api.get(`/hashtags/${encodeURIComponent(name)}/posts?page=${page}&limit=${limit}`);
};

/**
 * Get comments by hashtag with pagination
 */
export const getCommentsByHashtag = (name, page = 1, limit = 20) => {
    return api.get(`/hashtags/${encodeURIComponent(name)}/comments?page=${page}&limit=${limit}`);
};

const HashtagService = {
    getTopHashtags,
    getTrendingHashtags,
    searchHashtags,
    getPostsByHashtag,
    getCommentsByHashtag
};

export default HashtagService;
