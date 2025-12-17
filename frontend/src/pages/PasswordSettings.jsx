import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import './css/Settings.css';

const PasswordSettings = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [status, setStatus] = useState({ error: '', success: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus({ error: '', success: '' });

        if (form.newPassword !== form.confirmPassword) {
            setStatus({ error: t('settings.password.errors.mismatch'), success: '' });
            return;
        }

        setIsSubmitting(true);
        try {
            await AuthService.changePassword(form);
            setStatus({ error: '', success: t('settings.password.success') });
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
            setStatus({ error: apiMessage || t('settings.password.errors.generic'), success: '' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header-row">
                <button onClick={() => navigate(-1)} className="back-btn" aria-label={t('common.back', 'Retour')}>
                    <ArrowLeft size={24} />
                </button>
                <h2 className="settings-header-title">{t('settings.change_password')}</h2>
            </div>

            <div className="settings-section settings-section-card">
                <div className="settings-password-headline">
                    <Shield size={18} />
                    <p className="settings-theme-desc">{t('settings.password.description')}</p>
                </div>

                {status.error && (
                    <div className="settings-alert settings-alert-error" role="alert">
                        {status.error}
                    </div>
                )}
                {status.success && (
                    <div className="settings-alert settings-alert-success" role="status">
                        {status.success}
                    </div>
                )}

                <form className="settings-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="currentPassword">{t('settings.password.current')}</label>
                        <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            className="form-input"
                            value={form.currentPassword}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="newPassword">{t('settings.password.new')}</label>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            className="form-input"
                            value={form.newPassword}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">{t('settings.password.confirm')}</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className="form-input"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary settings-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t('common.loading') : t('settings.password.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordSettings;
