import React, { useMemo, useState } from 'react';
import { Twitter, Instagram, Linkedin, Mail, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import logo from '../assets/logo.svg';

const NAV_LINKS = [
    { to: '/about', key: 'footer.about' },
    { to: '/privacy', key: 'footer.privacy' },
    { to: '/terms', key: 'footer.terms' },
    { to: '/contact', key: 'footer.contact' }
];

const SOCIAL_LINKS = [
    { id: 'twitter', icon: Twitter, href: '#' },
    { id: 'instagram', icon: Instagram, href: '#' },
    { id: 'linkedin', icon: Linkedin, href: '#' },
    { id: 'mail', icon: Mail, href: '#' }
];

const LANG_OPTIONS = ['en', 'fr', 'es', 'auto'];
const THEME_OPTIONS = ['light', 'dark', 'auto'];

const LogoRow = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={logo} alt="EMsee Logo" style={{ height: '60px', objectFit: 'contain' }} />
    </div>
);

const LinkRow = ({ t }) => (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {NAV_LINKS.map((item) => (
            <Link key={item.to} to={item.to} style={{ color: 'var(--text-muted)' }}>{t(item.key)}</Link>
        ))}
    </div>
);

const SocialRow = () => (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
        {SOCIAL_LINKS.map(({ id, icon: Icon, href }) => (
            <a key={id} href={href} style={{ color: 'var(--text-muted)' }}><Icon size={20} /></a>
        ))}
    </div>
);

const Divider = () => <div style={{ width: '100%', height: '1px', background: '#E5E7EB', margin: '1rem 0' }} />;

const TogglePills = ({ options, selected, onSelect, renderLabel }) => (
    <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: '99px', border: '1px solid var(--border)' }}>
        {options.map((option) => {
            const isSelected = selected(option);
            return (
                <button
                    key={option}
                    onClick={() => onSelect(option)}
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
                    {renderLabel(option, isSelected)}
                </button>
            );
        })}
    </div>
);

const Footer = () => {
    const { i18n, t } = useTranslation();
    const { themeMode, setThemeMode } = useTheme();
    const [langMode, setLangMode] = useState(localStorage.getItem('language_mode') || 'manual');

    const languageSelected = useMemo(() => {
        return (lang) => langMode === 'auto' ? lang === 'auto' : (lang !== 'auto' && i18n.language.startsWith(lang));
    }, [i18n.language, langMode]);

    const toggleLanguage = (lang) => {
        if (lang === 'auto') {
            const systemLang = navigator.language.split('-')[0];
            const supportedLang = ['fr', 'en', 'es', 'de'].includes(systemLang) ? systemLang : 'fr';
            i18n.changeLanguage(supportedLang);
            localStorage.setItem('language_mode', 'auto');
            localStorage.removeItem('i18nextLng');
            setLangMode('auto');
            return;
        }
        i18n.changeLanguage(lang);
        localStorage.setItem('language_mode', 'manual');
        setLangMode('manual');
    };

    return (
        <footer style={{ background: 'var(--footer-bg)', padding: '4rem 0 2rem' }}>
            <div className="container">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', textAlign: 'center', padding: '0 1rem' }}>
                    <LogoRow />
                    <LinkRow t={t} />
                    <SocialRow />
                    <Divider />

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {t('footer.contributors')} <span style={{ fontWeight: '600' }}>Diouri Mehdi, Rkha Adam, Belaoud Mehdi, El Kharrazi Ibtihal</span>
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                            © {new Date().getFullYear()} EMsee Social. {t('footer.made_with_love')}
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <TogglePills
                                options={LANG_OPTIONS}
                                selected={(lang) => languageSelected(lang)}
                                onSelect={toggleLanguage}
                                renderLabel={(lang) => (
                                    <>
                                        {lang === 'auto' && <Globe size={12} />}
                                        {lang === 'auto' ? 'Auto' : lang.toUpperCase()}
                                    </>
                                )}
                            />

                            <TogglePills
                                options={THEME_OPTIONS}
                                selected={(mode) => themeMode === mode}
                                onSelect={setThemeMode}
                                renderLabel={(mode) => mode}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
