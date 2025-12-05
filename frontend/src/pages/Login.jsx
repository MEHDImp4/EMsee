import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './css/Login.css';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // mock auth: store a fake token and redirect to /feed
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('userEmail', email || 'user@example.com');
        localStorage.setItem('firstVisit', 'true');
        navigate('/feed');
    };

    return (
        <div className="auth-page">
            <div className="container auth-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="auth-card"
                >
                    <div className="auth-header">
                        <h1 className="auth-title">{t('auth.welcome_back')}</h1>
                        <p className="auth-subtitle">{t('auth.login_subtitle')}</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">{t('auth.email')}</label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    placeholder={t('auth.email_placeholder')}
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('auth.password')}</label>
                            <div className="input-wrapper">
                                <Lock size={20} className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('auth.login_btn')}</button>
                    </form>

                    <div className="auth-footer">
                        {t('auth.no_account')} <Link to="/register" className="auth-link">{t('auth.create_account')}</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
