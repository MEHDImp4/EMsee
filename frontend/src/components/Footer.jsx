import React from 'react';
import { Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

import logo from '../assets/logo.svg';

const Footer = () => {
    return (
        <footer style={{ background: 'var(--footer-bg)', padding: '4rem 0 2rem' }}>
            <div className="container">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={logo} alt="EMsee Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>EMsee</span>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <a href="#" style={{ color: 'var(--text-muted)' }}>À propos</a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}>Confidentialité</a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}>Conditions</a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}>Contact</a>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <a href="#" style={{ color: 'var(--text-muted)' }}><Twitter size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}><Instagram size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}><Linkedin size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}><Mail size={20} /></a>
                    </div>

                    <div style={{ width: '100%', height: '1px', background: '#E5E7EB', margin: '1rem 0' }}></div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Contributeurs : <span style={{ fontWeight: '600' }}>Diouri Mehdi, Rkha Adam, Belaoud Mehdi, El Kharazi Ibtihal</span>
                    </p>

                    <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                        © {new Date().getFullYear()} EMsee Social. Fait avec ❤️ pour les étudiants.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
