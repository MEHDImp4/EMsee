import React from 'react';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.svg';

const MobileHeader = ({ onAvatarClick }) => {
    return (
        <div className="mobile-header">
            <div className="mobile-header-left">
                <div className="avatar-circle-small" onClick={onAvatarClick}>
                    MA
                </div>
            </div>

            <div className="mobile-header-center">
                <img src={logo} alt="Logo" style={{ width: 28, height: 28 }} />
            </div>

            <div className="mobile-header-right">
                <Settings size={22} color="var(--text-main)" />
            </div>
        </div>
    );
};

export default MobileHeader;
