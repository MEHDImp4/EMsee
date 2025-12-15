import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/HashtagText.css';

/**
 * Component to render text with clickable hashtags
 * Converts hashtags (#word) into clickable links
 */
const HashtagText = ({ content }) => {
    const navigate = useNavigate();

    if (!content) return null;

    // Split content by hashtags while preserving them
    const parts = content.split(/(#[\w\u00C0-\u017F]+)/g);

    const handleHashtagClick = (e, hashtag) => {
        e.preventDefault();
        e.stopPropagation();
        // Navigate to explore with the hashtag prefilled in query param
        navigate(`/explore?q=${encodeURIComponent(hashtag)}`);
    };

    return (
        <span className="hashtag-text">
            {parts.map((part, index) => {
                // Check if this part is a hashtag
                if (part.match(/^#[\w\u00C0-\u017F]+$/)) {
                    return (
                        <a
                            key={index}
                            href={`/hashtags/${part.slice(1)}`}
                            className="hashtag-link"
                            onClick={(e) => handleHashtagClick(e, part)}
                        >
                            {part}
                        </a>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

export default HashtagText;
