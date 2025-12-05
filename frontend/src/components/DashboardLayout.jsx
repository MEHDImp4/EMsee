import React from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                {children || <Outlet />}
            </main>
            <RightSidebar />
        </div>
    );
};

export default DashboardLayout;
