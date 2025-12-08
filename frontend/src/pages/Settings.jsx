import React from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor } from 'lucide-react';

const Settings = ({ themeMode, setThemeMode }) => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="settings-page">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t('sidebar.settings', 'Paramètres')}</h2>

            <div className="settings-section" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1rem' }}>{t('settings.appearance', 'Apparence')}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{t('settings.theme_desc', 'Choisissez votre thème préféré.')}</p>

                <div className="theme-options" style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn btn-outline ${themeMode === 'light' ? 'btn-primary' : ''}`}
                        onClick={() => setThemeMode('light')}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: themeMode === 'light' ? 'var(--primary)' : 'var(--border)' }}
                    >
                        <Sun size={18} /> {t('settings.themes.light', 'Clair')}
                    </button>
                    <button
                        className={`btn btn-outline ${themeMode === 'dark' ? 'btn-primary' : ''}`}
                        onClick={() => setThemeMode('dark')}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: themeMode === 'dark' ? 'var(--primary)' : 'var(--border)' }}
                    >
                        <Moon size={18} /> {t('settings.themes.dark', 'Sombre')}
                    </button>
                    <button
                        className={`btn btn-outline ${themeMode === 'auto' ? 'btn-primary' : ''}`}
                        onClick={() => setThemeMode('auto')}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: themeMode === 'auto' ? 'var(--primary)' : 'var(--border)' }}
                    >
                        <Monitor size={18} /> {t('settings.themes.auto', 'Auto')}
                    </button>
                </div>
            </div>

            <div className="settings-section" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '1.5rem', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1rem' }}>{t('settings.language', 'Langue')}</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
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
