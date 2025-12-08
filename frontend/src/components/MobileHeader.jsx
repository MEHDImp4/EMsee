import React from 'react';
import { Link } from 'react-router-dom';

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
                <Link to="/feed">
                    <img src={logo} alt="Logo" style={{ width: 28, height: 28 }} />
                </Link>
            </div>

            <div className="mobile-header-right" style={{ width: 32 }}>
                {/* Empty to balance layout */}
            </div>
        </div>
    );
};

export default MobileHeader;
