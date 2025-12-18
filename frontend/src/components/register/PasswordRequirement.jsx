import React from 'react';
import { Check, X } from 'lucide-react';

const PasswordRequirement = ({ met, text }) => (
    <div className={`password-requirement ${met ? 'met' : 'unmet'}`} style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.85rem',
        color: met ? 'var(--success)' : 'var(--text-secondary)',
        marginBottom: '4px',
        opacity: met ? 1 : 0.7
    }}>
        {met ? <Check size={14} style={{ marginRight: '6px' }} /> : <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid currentColor', marginRight: '6px' }} />}
        <span>{text}</span>
    </div>
);

export default PasswordRequirement;
