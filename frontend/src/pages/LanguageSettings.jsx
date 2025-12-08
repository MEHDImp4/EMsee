import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Monitor } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './css/Settings.css';

const LanguageSettings = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    // Determine initial mode: check localStorage or default to 'manual' (or 'auto' if not set but that might conflict with existing users)
    // Actually, let's assume 'manual' unless 'auto' is explicitly set.
    const [mode, setMode] = React.useState(localStorage.getItem('language_mode') || 'manual');

    const changeLanguage = (lng) => {
        if (lng === 'auto') {
            const systemLang = navigator.language.split('-')[0];
            const supportedLang = ['fr', 'en'].includes(systemLang) ? systemLang : 'fr'; // fallback to fr
            i18n.changeLanguage(supportedLang);
            localStorage.setItem('language_mode', 'auto');
            setMode('auto');
            // We might want to clear i18nextLng to let detector work, but explicit set is safer for immediate effect
            localStorage.removeItem('i18nextLng');
        } else {
            i18n.changeLanguage(lng);
            localStorage.setItem('language_mode', 'manual');
            setMode('manual');
        }
    };

    const languages = [
        { code: 'auto', label: t('settings.themes.auto', 'Automatique') + ` (${navigator.language.split('-')[0]})`, icon: <Monitor size={20} /> },
        { code: 'fr', label: 'Français', icon: <span style={{ fontSize: '1.2rem' }}>🇫🇷</span> },
        { code: 'en', label: 'English', icon: <span style={{ fontSize: '1.2rem' }}>🇬🇧</span> }
    ];

    return (
        <div className="settings-page">
            <div className="settings-header-row">
                <button onClick={() => navigate(-1)} className="back-btn" aria-label={t('common.back', 'Retour')}>
                    <ArrowLeft size={24} />
                </button>
                <h2 className="settings-header-title">{t('settings.language', 'Langue')}</h2>
            </div>

            <div className="settings-section settings-section-card">
                <div className="language-list">
                    {languages.map((lang) => {
                        const isSelected = mode === 'auto'
                            ? lang.code === 'auto'
                            : (lang.code !== 'auto' && i18n.language.startsWith(lang.code));

                        return (
                            <button
                                key={lang.code}
                                className="language-item"
                                onClick={() => changeLanguage(lang.code)}
                                role="radio"
                                aria-checked={isSelected}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {lang.icon}
                                    <span>{lang.label}</span>
                                </div>
                                {isSelected && <Check size={20} className="check-icon" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LanguageSettings;
