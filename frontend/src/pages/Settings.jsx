import React from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './css/Settings.css';

const Settings = () => {
    const { t, i18n } = useTranslation();
    const { themeMode, setThemeMode } = useTheme();
    const navigate = useNavigate();

    const languageLabel = React.useMemo(() => {
        const mode = localStorage.getItem('language_mode');
        if (mode === 'auto') return t('settings.language_auto', 'Auto');
        if (i18n.language.startsWith('fr')) return 'Français';
        if (i18n.language.startsWith('es')) return 'Español';
        return 'English';
    }, [i18n.language, t]);


    return (
        <div className="settings-page">
            <h2 className="settings-header-title">{t('sidebar.settings', 'Paramètres')}</h2>

            <div className="settings-section settings-section-card">
                <h3 className="settings-section-title">{t('settings.appearance', 'Apparence')}</h3>
                <p className="settings-theme-desc">{t('settings.theme_desc', 'Choisissez votre thème préféré.')}</p>

                <div className="theme-options theme-options-flex">
                    <button
                        className={`btn btn-outline theme-btn ${themeMode === 'light' ? 'btn-primary' : ''}`}
                        onClick={() => setThemeMode('light')}
                        style={{ borderColor: themeMode === 'light' ? 'var(--primary)' : 'var(--border)' }}
                    >
                        <Sun size={18} /> {t('settings.themes.light', 'Clair')}
                    </button>
                    <button
                        className={`btn btn-outline theme-btn ${themeMode === 'dark' ? 'btn-primary' : ''}`}
                        onClick={() => setThemeMode('dark')}
                        style={{ borderColor: themeMode === 'dark' ? 'var(--primary)' : 'var(--border)' }}
                    >
                        <Moon size={18} /> {t('settings.themes.dark', 'Sombre')}
                    </button>
                    <button
                        className={`btn btn-outline theme-btn ${themeMode === 'auto' ? 'btn-primary' : ''}`}
                        onClick={() => setThemeMode('auto')}
                        style={{ borderColor: themeMode === 'auto' ? 'var(--primary)' : 'var(--border)' }}
                    >
                        <Monitor size={18} /> {t('settings.themes.auto', 'Auto')}
                    </button>
                </div>
            </div>

            <div className="settings-section settings-section-card">
                <h3 className="settings-section-title">{t('settings.account_security')}</h3>
                <div className="settings-nav-list">
                    <button
                        className="settings-nav-item"
                        onClick={() => navigate('/settings/language')}
                    >
                        <span style={{ fontWeight: '500' }}>{t('settings.language', 'Langue')}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <span>{languageLabel}</span>
                            <span style={{ fontSize: '1.2rem' }}>›</span>
                        </div>
                    </button>

                    <button
                        className="settings-nav-item"
                        onClick={() => navigate('/settings/password')}
                    >
                        <span style={{ fontWeight: '500' }}>{t('settings.change_password')}</span>
                        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>›</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
