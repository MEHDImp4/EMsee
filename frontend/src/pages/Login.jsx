import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './css/Login.css';

const Login = () => {
    const { t } = useTranslation();

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

                    <form className="auth-form">
                        <div className="form-group">
                            <label className="form-label">{t('auth.email')}</label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    placeholder={t('auth.email_placeholder')}
                                    className="form-input"
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
