import React from 'react';
import { Plus } from 'lucide-react';

const FloatingPostButton = ({ onClick }) => {
    return (
        <button className="floating-post-btn" onClick={onClick}>
            <Plus size={28} color="white" />
        </button>
    );
};

export default FloatingPostButton;
