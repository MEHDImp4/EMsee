import React from 'react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.svg';
import UserAvatar from './UserAvatar';

const MobileHeader = ({ onAvatarClick, user }) => {
    return (
        <div className="mobile-header">
            <div className="mobile-header-left">
                <div onClick={onAvatarClick}>
                    <UserAvatar user={user} size={32} />
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
