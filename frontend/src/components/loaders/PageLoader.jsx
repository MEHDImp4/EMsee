
import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            background: 'var(--bg-main)'
        }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid var(--border)',
                    borderTop: '4px solid var(--primary)',
                    borderRadius: '50%'
                }}
            />
        </div>
    );
};

export default PageLoader;
