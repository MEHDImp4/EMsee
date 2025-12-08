import React from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor } from 'lucide-react';
import './css/Settings.css';

const Settings = ({ themeMode, setThemeMode }) => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

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

            <div className="settings-section settings-section-card-last">
                <h3 className="settings-section-title">{t('settings.language', 'Langue')}</h3>
                <div className="lang-options-flex">
                    <button
                        className={`btn ${i18n.language.startsWith('en') ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => changeLanguage('en')}
                    >
                        English
                    </button>
                    <button
                        className={`btn ${i18n.language.startsWith('fr') ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => changeLanguage('fr')}
                    >
                        Français
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
