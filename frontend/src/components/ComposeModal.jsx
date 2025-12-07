import React, { useState } from 'react';
import { X, Image, BarChart2, Code, Smile, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ComposeModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [text, setText] = useState('');

    if (!isOpen) return null;

    return (
        <div className="compose-modal-overlay">
            <div className="compose-modal">
                <div className="compose-modal-header">
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                    <button className="post-btn-small" disabled={!text.trim()}>
                        {t('sidebar.publish', 'Publier')}
                    </button>
                </div>

                <div className="compose-modal-content">
                    <div className="compose-user-row">
                        <div className="avatar-circle" style={{ width: 40, height: 40 }}>MA</div>
                    </div>

                    <textarea
                        className="compose-modal-input"
                        placeholder={t('feed.placeholder', "Quoi de neuf à l'EMSI ?")}
                        autoFocus
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <div className="compose-reply-permission">
                        <Globe size={16} />
                        <span>{t('feed.everyone_can_reply', 'Tout le monde peut répondre')}</span>
                    </div>

                    <div className="compose-modal-footer">
                        <div className="compose-icons" style={{ marginLeft: 0 }}>
                            <button className="icon-btn"><Image size={24} color="var(--primary)" /></button>
                            <button className="icon-btn"><BarChart2 size={24} color="var(--primary)" /></button>
                            <button className="icon-btn"><Code size={24} color="var(--primary)" /></button>
                            <button className="icon-btn"><Smile size={24} color="var(--primary)" /></button>
                        </div>
                        {/* Character count or other indicators could go here */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComposeModal;
