import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, MessageSquare, Bookmark, Users, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MobileBottomNav = () => {
    const { t } = useTranslation();

    const navItems = [
        { icon: Home, path: '/feed', label: 'Home' },
        { icon: Compass, path: '/explore', label: 'Explore' },
        { icon: Bell, path: '/notifications', label: 'Notifications' },
        { icon: MessageSquare, path: '/messages', label: 'Messages' },
    ];

    return (
        <nav className="mobile-bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                >
                    {({ isActive }) => (
                        <item.icon size={26} strokeWidth={isActive ? 3 : 2} />
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default MobileBottomNav;
