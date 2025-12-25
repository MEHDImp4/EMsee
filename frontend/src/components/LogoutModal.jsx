import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.svg';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1rem' }}>
                    <div className="logo-circle" style={{ width: 80, height: 80, marginBottom: '1rem', cursor: 'default' }}>
                        <img src={logo} alt="Logo" style={{ width: 48, height: 48 }} />
                    </div>
                    <h3 className="modal-title">{t('sidebar.logout_confirm', 'Se déconnecter de EMsee ?')}</h3>
                    <p className="modal-desc">
                        {t('sidebar.logout_desc', 'Vous pourrez toujours vous reconnecter à tout moment. Si vous voulez juste changer de compte, vous pouvez ajouter un compte existant.')}
                    </p>
                </div>

                <div className="modal-actions" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        className="btn btn-danger"
                        onClick={onConfirm}
                        style={{ width: '100%', borderRadius: '99px', padding: '0.75rem' }}
                    >
                        {t('sidebar.logout_btn', 'Se déconnecter')}
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={onClose}
                        style={{ width: '100%', borderRadius: '99px', padding: '0.75rem', border: '1px solid var(--border)' }}
                    >
                        {t('sidebar.cancel', 'Annuler')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LogoutModal;
