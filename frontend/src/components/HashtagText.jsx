import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './css/HashtagText.css';

/**
 * Component to render text with clickable hashtags and mentions
 * Converts hashtags (#word) and mentions (@user) into clickable links
 */
const HashtagText = ({ content }) => {
    const navigate = useNavigate();

    if (!content) return null;

    // Split content by hashtags and mentions while preserving them
    // Captures #hashtag or @username
    const parts = content.split(/((?:#[a-zA-Z0-9_\u00C0-\u017F]+)|(?:@[a-zA-Z0-9_\u00C0-\u017F]+))/g);

    return (
        <span className="hashtag-text">
            {parts.map((part, index) => {
                if (part.startsWith('#')) {
                    const hashtag = part.slice(1);
                    return (
                        <Link
                            key={index}
                            to={`/hashtag/${hashtag}`}
                            className="hashtag-link"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </Link>
                    );
                }

                if (part.startsWith('@')) {
                    const username = part.slice(1);
                    return (
                        <Link
                            key={index}
                            to={`/profile/${username}`}
                            className="mention-link"
                            style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </Link>
                    );
                }

                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

export default HashtagText;
