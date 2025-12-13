import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ThreadHeader = ({ onBack, title = 'Post' }) => {
    return (
        <div className="thread-header">
            <button className="back-button" onClick={onBack}>
                <ArrowLeft size={20} />
            </button>
            <h2>{title}</h2>
        </div>
    );
};

export default ThreadHeader;
