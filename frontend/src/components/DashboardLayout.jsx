import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import FloatingPostButton from './FloatingPostButton';
import ComposeModal from './ComposeModal';
import { Outlet, useLocation } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

const DashboardLayout = ({ children }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { isComposeOpen, openCompose, closeCompose, replyTo } = useModal();
    const location = useLocation();

    // Hide right sidebar on messages page
    const isMessagesPage = location.pathname === '/messages';

    // Close drawer on route change
    useEffect(() => {
        setIsDrawerOpen(false);
    }, [location]);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Swipe Thresholds
    const minSwipeDistance = 50;
    const edgeSwipeLimit = 40; // Only allow swipe-to-open from the left edge

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        // Close Drawer on Swipe Left
        if (isDrawerOpen && isLeftSwipe) {
            setIsDrawerOpen(false);
        }

        // Open Drawer on Swipe Right (only if starting from left edge)
        if (!isDrawerOpen && isRightSwipe && touchStart < edgeSwipeLimit) {
            setIsDrawerOpen(true);
        }
    };

    return (
        <div
            className={`app-layout ${isMessagesPage ? 'messages-page-layout' : ''}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
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

            {!isMessagesPage && <RightSidebar />}

            {/* FAB opens the compose modal */}
            <FloatingPostButton onClick={() => openCompose()} />

            <MobileBottomNav />

            {/* Global Compose Modal managed by Context */}
            <ComposeModal
                isOpen={isComposeOpen}
                onClose={closeCompose}
                replyTo={replyTo}
            />
        </div>
    );
};

export default DashboardLayout;
