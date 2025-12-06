import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import About from './pages/About';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import Explore from './pages/Explore';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

function App() {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'auto');

  useEffect(() => {
    const applyTheme = (mode) => {
      const root = document.documentElement;
      let targetTheme = mode;

      if (mode === 'auto') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        targetTheme = systemPrefersDark ? 'dark' : 'light';
      }

      if (targetTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    };

    applyTheme(themeMode);
    localStorage.setItem('themeMode', themeMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (themeMode === 'auto') applyTheme('auto');
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themeMode]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout themeMode={themeMode} setThemeMode={setThemeMode} />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Protected Routes (Dashboard) */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/feed" element={<Feed />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings themeMode={themeMode} setThemeMode={setThemeMode} />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/bookmarks" element={<div className="container" style={{ padding: '2rem' }}><h2>Signets</h2><p>Coming Soon</p></div>} />
          <Route path="/community" element={<div className="container" style={{ padding: '2rem' }}><h2>Communauté</h2><p>Coming Soon</p></div>} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
