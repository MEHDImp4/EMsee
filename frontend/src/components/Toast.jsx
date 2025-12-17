import React, { useEffect } from 'react';
import './css/Toast.css';

const Toast = ({ message, variant = 'error', duration = 4500, onClose }) => {
    useEffect(() => {
        if (!message) return;
        const id = setTimeout(() => {
            if (onClose) onClose();
        }, duration);
        return () => clearTimeout(id);
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <div className={`toast toast-${variant}`} role="alert" aria-live="assertive">
            <div className="toast-message">{message}</div>
            <button
                className="toast-close"
                aria-label="Close"
                onClick={(e) => {
                    e.stopPropagation();
                    if (onClose) onClose();
                }}
            >
                ×
            </button>
        </div>
    );
};

export default Toast;
