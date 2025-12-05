import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const PublicLayout = ({ themeMode, setThemeMode }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </main>
            <Footer themeMode={themeMode} setThemeMode={setThemeMode} />
        </div>
    );
};

export default PublicLayout;
