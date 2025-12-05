import React from 'react';
import { Search } from 'lucide-react';

const RightSidebar = () => {
    return (
        <aside className="right-sidebar">
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Rechercher..."
                    style={{
                        width: '100%',
                        padding: '0.8rem 1rem 0.8rem 3rem',
                        borderRadius: '99px',
                        border: 'none',
                        backgroundColor: 'var(--hover)',
                        color: 'var(--text-main)',
                        outline: 'none'
                    }}
                />
            </div>

            <div className="suggestions" style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Suggestions</h3>
                {/* Mock Suggestions */}
                {[1, 2].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#333' }}></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>Utilisateur {i}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Étudiant</div>
                        </div>
                        <button style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Suivre</button>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default RightSidebar;
