import React from 'react';
import { Twitter, Instagram, Linkedin, Mail, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import logo from '../assets/logo.svg';

const Footer = () => {
    const { i18n, t } = useTranslation();
    const { themeMode, setThemeMode } = useTheme();

    const [langMode, setLangMode] = React.useState(localStorage.getItem('language_mode') || 'manual');

    const toggleLanguage = (lang) => {
        if (lang === 'auto') {
            const systemLang = navigator.language.split('-')[0];
            const supportedLang = ['fr', 'en', 'es', 'de'].includes(systemLang) ? systemLang : 'fr';
            i18n.changeLanguage(supportedLang);
            localStorage.setItem('language_mode', 'auto');
            localStorage.removeItem('i18nextLng');
            setLangMode('auto');
        } else {
            i18n.changeLanguage(lang);
            localStorage.setItem('language_mode', 'manual');
            setLangMode('manual');
        }
    };

    return (
        <footer style={{ background: 'var(--footer-bg)', padding: '4rem 0 2rem' }}>
            <div className="container">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={logo} alt="EMsee Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>EMsee</span>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link to="/about" style={{ color: 'var(--text-muted)' }}>{t('footer.about')}</Link>
                        <a href="#" style={{ color: 'var(--text-muted)' }}>{t('footer.privacy')}</a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}>{t('footer.terms')}</a>
                        <Link to="/contact" style={{ color: 'var(--text-muted)' }}>{t('footer.contact')}</Link>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <a href="#" style={{ color: 'var(--text-muted)' }}><Twitter size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}><Instagram size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}><Linkedin size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}><Mail size={20} /></a>
                    </div>

                    <div style={{ width: '100%', height: '1px', background: '#E5E7EB', margin: '1rem 0' }}></div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {t('footer.contributors')} <span style={{ fontWeight: '600' }}>Diouri Mehdi, Rkha Adam, Belaoud Mehdi, El Kharazi Ibtihal</span>
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                            © {new Date().getFullYear()} EMsee Social. {t('footer.made_with_love')}
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            {/* Language Toggle */}
                            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: '99px', border: '1px solid var(--border)' }}>
                                {['en', 'fr', 'es', 'de', 'auto'].map((lang) => {
                                    const mode = localStorage.getItem('language_mode') || 'manual';
                                    const isSelected = mode === 'auto'
                                        ? lang === 'auto'
                                        : (lang !== 'auto' && i18n.language.startsWith(lang));

                                    return (
                                        <button
                                            key={lang}
                                            onClick={() => toggleLanguage(lang)}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '99px',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                border: 'none',
                                                background: isSelected ? 'var(--primary)' : 'transparent',
                                                color: isSelected ? 'white' : 'var(--text-muted)',
                                                transition: 'all 0.2s',
                                                textTransform: 'capitalize',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}
                                        >
                                            {lang === 'auto' && <Globe size={12} />}
                                            {lang === 'auto' ? 'Auto' : lang === 'fr' ? 'FR' : lang === 'en' ? 'EN' : lang === 'es' ? 'ES' : 'DE'}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Theme Toggle */}
                            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: '99px', border: '1px solid var(--border)' }}>
                                {['light', 'dark', 'auto'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setThemeMode(mode)}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '99px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            border: 'none',
                                            background: themeMode === mode ? 'var(--primary)' : 'transparent',
                                            color: themeMode === mode ? 'white' : 'var(--text-muted)',
                                            transition: 'all 0.2s',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
