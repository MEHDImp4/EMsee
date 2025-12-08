
import React from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RegisterStep4 = ({
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isPasswordValid,
    doPasswordsMatch,
    showErrors,
    showPassword, setShowPassword
}) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="form-group">
                <label className="form-label">{t('auth.password')}</label>
                <div className="input-wrapper">
                    <Lock size={20} className="input-icon" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="form-input"
                        value={password}
                        style={{
                            paddingRight: '2.5rem',
                            borderColor: (showErrors && !password) || isPasswordValid === false ? 'var(--danger)' : isPasswordValid === true ? 'var(--primary)' : undefined
                        }}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle-btn"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <p className="password-hint">
                    {t('auth.password_hint')}
                </p>
                {showErrors && !password && <p className="error-message">{t('auth.field_required')}</p>}
                {isPasswordValid === false && (
                    <p className="error-message">
                        {t('auth.password_requirements')}
                    </p>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">{t('auth.confirm_password')}</label>
                <div className="input-wrapper">
                    <Lock size={20} className="input-icon" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="form-input"
                        value={confirmPassword}
                        style={{
                            borderColor: (showErrors && !confirmPassword) || doPasswordsMatch === false ? 'var(--danger)' : doPasswordsMatch === true ? 'var(--primary)' : undefined
                        }}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {doPasswordsMatch === true && <CheckCircle size={20} color="var(--primary)" className="input-status-icon" />}
                    {doPasswordsMatch === false && <AlertCircle size={20} color="var(--danger)" className="input-status-icon" />}
                </div>
                {showErrors && !confirmPassword && <p className="error-message">{t('auth.field_required')}</p>}
                {doPasswordsMatch === false && (
                    <p className="error-message">
                        {t('auth.password_mismatch')}
                    </p>
                )}
            </div>
        </>
    );
};

export default RegisterStep4;
