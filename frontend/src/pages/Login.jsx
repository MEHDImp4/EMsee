import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import useLoginForm from '../hooks/useLoginForm';
import Toast from '../components/Toast';
import './css/Login.css';

const Login = () => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();

    const {
        email,
        setEmail,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        errors,
        setErrors,
        handleSubmit
    } = useLoginForm({ login, navigate });

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
                            <label className="form-label" htmlFor="email">{t('auth.email')}</label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" aria-hidden="true" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder={t('auth.student_placeholder')}
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors({ ...errors, email: false });
                                    }}
                                    autoComplete="email"
                                    style={{ borderColor: errors.email ? 'var(--danger)' : undefined }}
                                    aria-invalid={errors.email ? "true" : "false"}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                />
                            </div>
                            {errors.email && <p id="email-error" className="error-message" role="alert">{t('auth.field_required')}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">{t('auth.password')}</label>
                            <div className="input-wrapper">
                                <Lock size={20} className="input-icon" aria-hidden="true" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors({ ...errors, password: false });
                                    }}
                                    autoComplete="current-password"
                                    style={{
                                        paddingRight: '2.5rem',
                                        borderColor: errors.password ? 'var(--danger)' : undefined
                                    }}
                                    aria-invalid={errors.password ? "true" : "false"}
                                    aria-describedby={errors.password ? "password-error" : undefined}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && <p id="password-error" className="error-message" role="alert">{t('auth.field_required')}</p>}
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('auth.login_btn')}</button>
                    </form>

                    {errors.form && (
                        <Toast
                            message={errors.form}
                            variant="error"
                            onClose={() => setErrors({ ...errors, form: null })}
                        />
                    )}

                    <div className="auth-footer">
                        {t('auth.no_account')} <Link to="/register" className="auth-link">{t('auth.create_account')}</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
