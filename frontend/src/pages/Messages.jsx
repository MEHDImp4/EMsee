import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Messages = () => {
    const { t } = useTranslation();

    return (
        <div className="messages-page" style={{ flex: 1, borderRight: '1px solid var(--border)' }}>
            <div className="feed-header sticky-header" style={{ padding: '0.5rem 1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Messages</h2>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60vh',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                }}>
                    <MessageSquare size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {t('messages.welcome_title', 'Bienvenue dans vos messages')}
                </h3>
                <p style={{ maxWidth: '400px', lineHeight: 1.5 }}>
                    {t('messages.welcome_desc', 'Connectez-vous avec d\'autres étudiants et professeurs en privé. Sélectionnez une conversation pour commencer.')}
                </p>
                <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                    {t('messages.start_conv', 'Nouvelle conversation')}
                </button>
            </div>
        </div>
    );
};

export default Messages;
