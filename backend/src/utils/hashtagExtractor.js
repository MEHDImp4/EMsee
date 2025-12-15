/**
 * Extracts hashtags from text content
 * Matches patterns like #hashtag, #Programming, #react2024
 * @param {string} content - The text content to extract hashtags from
 * @returns {string[]} - Array of unique hashtag names (without #, lowercase)
 */
function extractHashtags(content) {
    if (!content || typeof content !== 'string') {
        return [];
    }

    // Regex to match hashtags: # followed by alphanumeric characters (including accents)
    // Supports: #JavaScript, #React2024, #développement, #français
    const hashtagRegex = /#([\w\u00C0-\u017F]+)/g;
    const matches = content.matchAll(hashtagRegex);
    
    const hashtags = [];
    for (const match of matches) {
        // Convert to lowercase and remove duplicates
        const tag = match[1].toLowerCase();
        if (!hashtags.includes(tag)) {
            hashtags.push(tag);
        }
    }
    
    return hashtags;
}

/**
 * Converts content text with hashtags into HTML with clickable links
 * @param {string} content - The text content
 * @returns {string} - Content with hashtags wrapped in anchor tags
 */
function linkifyHashtags(content) {
    if (!content || typeof content !== 'string') {
        return content;
    }

    // Replace hashtags with anchor tags
    return content.replace(
        /#([\w\u00C0-\u017F]+)/g,
        '<a href="/hashtags/$1" class="hashtag-link">#$1</a>'
    );
}

module.exports = {
    extractHashtags,
    linkifyHashtags
};
