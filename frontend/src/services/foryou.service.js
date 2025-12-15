import api from './api';

/**
 * Get personalized "For You" hashtag recommendations
 */
export const getForYouHashtags = (limit = 10, days = 7) => {
    return api.get(`/for-you/hashtags?limit=${limit}&days=${days}`);
};

const ForYouService = {
    getForYouHashtags
};

export default ForYouService;
