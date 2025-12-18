
import React from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PasswordRequirement from './PasswordRequirement';

const RegisterStep4 = ({ form, setField, validation, showErrors, errors }) => {
    const { t } = useTranslation();
    const { password, confirmPassword, showPassword } = form;
    const { isPasswordValid, doPasswordsMatch, passwordCriteria } = validation;

    const getBorderColor = (hasError, isValid) => {
        if (hasError || isValid === false) return 'var(--danger)';
        if (isValid === true) return 'var(--primary)';
        return undefined;
    };

    const passwordBorderColor = getBorderColor(showErrors && !password, isPasswordValid);
    const confirmPasswordBorderColor = getBorderColor(showErrors && !confirmPassword, doPasswordsMatch);

    return (
        <>
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
                        style={{
                            paddingRight: '2.5rem',
                            borderColor: passwordBorderColor
                        }}
                        onChange={(e) => setField('password', e.target.value)}
                        autoFocus
                        aria-invalid={(showErrors && !password) || isPasswordValid === false ? "true" : "false"}
                        aria-describedby="password-hint password-error"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setField('showPassword', !showPassword)}
                        className="password-toggle-btn"
                        aria-label={showPassword ? t('auth.hide_password', 'Masquer le mot de passe') : t('auth.show_password', 'Afficher le mot de passe')}
                    >
                        {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                    </button>
                </div>
                <p id="password-hint" className="password-hint">
                    {t('auth.password_hint')}
                </p>
                {showErrors && !password && <p className="error-message" role="alert">{t('auth.field_required')}</p>}
                {isPasswordValid === false && (
                    <p id="password-error" className="error-message" role="alert">
                        {errors?.passwordError}
                    </p>
                )}

                {/* Password Strength Checklist */}
                <div className="password-checklist" style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <PasswordRequirement met={passwordCriteria?.hasLength} text={t('auth.req_length', 'Minimum 6 caractères')} />
                    <PasswordRequirement met={passwordCriteria?.hasUpper} text={t('auth.req_upper', 'Une majuscule')} />
                    <PasswordRequirement met={passwordCriteria?.hasLower} text={t('auth.req_lower', 'Une minuscule')} />
                    <PasswordRequirement met={passwordCriteria?.hasDigit} text={t('auth.req_digit', 'Un chiffre')} />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">{t('auth.confirm_password')}</label>
                <div className="input-wrapper">
                    <Lock size={20} className="input-icon" aria-hidden="true" />
                    <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="form-input"
                        value={confirmPassword}
                        style={{
                            borderColor: confirmPasswordBorderColor
                        }}
                        onChange={(e) => setField('confirmPassword', e.target.value)}
                        aria-invalid={doPasswordsMatch === false ? "true" : "false"}
                        aria-describedby="match-error"
                        autoComplete="new-password"
                    />
                    {doPasswordsMatch === true && <CheckCircle size={20} color="var(--primary)" className="input-status-icon" aria-hidden="true" />}
                    {doPasswordsMatch === false && <AlertCircle size={20} color="var(--danger)" className="input-status-icon" aria-hidden="true" />}
                </div>
                {showErrors && !confirmPassword && <p className="error-message" role="alert">{t('auth.field_required')}</p>}
                {doPasswordsMatch === false && (
                    <p id="match-error" className="error-message" role="alert">
                        {t('auth.password_mismatch')}
                    </p>
                )}
            </div>
        </>
    );
};

export default RegisterStep4;
