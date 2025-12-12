import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ModalProvider } from './context/ModalContext';

import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/loaders/PageLoader';

// Lazy Loaded Pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Contact = lazy(() => import('./pages/Contact'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const About = lazy(() => import('./pages/About'));
const Feed = lazy(() => import('./pages/Feed'));
const Messages = lazy(() => import('./pages/Messages'));
const Explore = lazy(() => import('./pages/Explore'));
const Settings = lazy(() => import('./pages/Settings'));
const LanguageSettings = lazy(() => import('./pages/LanguageSettings'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const PostPage = lazy(() => import('./pages/PostPage'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ModalProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/about" element={<About />} />
                  </Route>

                  {/* Protected Routes (Dashboard) */}
                  <Route element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/post/:id" element={<PostPage />} /> {/* New Route */}
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/language" element={<LanguageSettings />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/bookmarks" element={<div className="container" style={{ padding: '2rem' }}><h2>Signets</h2><p>Coming Soon</p></div>} />
                    <Route path="/community" element={<div className="container" style={{ padding: '2rem' }}><h2>Communauté</h2><p>Coming Soon</p></div>} />
                  </Route>

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </ModalProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
