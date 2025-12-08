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

            <div className="settings-section settings-section-card-last" style={{ padding: '0 1.5rem' }}>
                <button
                    className="settings-nav-item"
                    onClick={() => navigate('/settings/language')}
                >
                    <span style={{ fontWeight: '500' }}>{t('settings.language', 'Langue')}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <span>{i18n.language.startsWith('fr') ? 'Français' : 'English'}</span>
                        {/* ChevronRight icon could be imported, but for now purely text/layout based or assume import */}
                        <span style={{ fontSize: '1.2rem' }}>›</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Settings;
