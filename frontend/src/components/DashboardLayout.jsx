import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import FloatingPostButton from './FloatingPostButton';
import ComposeModal from './ComposeModal';
import { Outlet, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const location = useLocation();

    // Close drawer and modal on route change
    useEffect(() => {
        setIsDrawerOpen(false);
        setIsComposeOpen(false);
    }, [location]);

    return (
        <div className="app-layout">
            <MobileHeader onAvatarClick={() => setIsDrawerOpen(true)} />

            <Sidebar
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />

            {/* Overlay for drawer */}
            {isDrawerOpen && (
                <div
                    className="drawer-overlay"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            <main className="main-content">
                {children || <Outlet />}
            </main>

            <RightSidebar />

            {/* FAB opens the compose modal */}
            <FloatingPostButton onClick={() => setIsComposeOpen(true)} />

            <MobileBottomNav />

            <ComposeModal
                isOpen={isComposeOpen}
                onClose={() => setIsComposeOpen(false)}
            />
        </div>
    );
};

export default DashboardLayout;
