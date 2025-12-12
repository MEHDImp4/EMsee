
import React from 'react';
import { User, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RegisterStep2 = ({ form, setField, validation, errors, showErrors, onBlur }) => {
    const { t } = useTranslation();
    const { fullName, username, email, accountType } = form;
    const { isUsernameValid, isEmailValid } = validation;
    const { usernameApiError, emailApiError } = errors;

    return (
        <>
            <div className="form-group">
                <label className="form-label" htmlFor="fullName">{t('auth.full_name')}</label>
                <div className="input-wrapper">
                    <User size={20} className="input-icon" aria-hidden="true" />
                    <input
                        id="fullName"
                        type="text"
                        placeholder={t('auth.fullname_placeholder', 'John Doe')}
                        className="form-input"
                        value={fullName}
                        onChange={(e) => setField('fullName', e.target.value)}
                        autoFocus
                        aria-invalid={showErrors && !fullName ? "true" : "false"}
                        aria-describedby={showErrors && !fullName ? "fullname-error" : undefined}
                        style={{ borderColor: showErrors && !fullName ? 'var(--danger)' : undefined }}
                    />
                </div>
                {showErrors && !fullName && <p id="fullname-error" className="error-message" role="alert">{t('auth.field_required')}</p>}
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="username">{t('auth.username')}</label>
                <div className="input-wrapper">
                    <span className="input-prefix" aria-hidden="true">@</span>
                    <input
                        id="username"
                        type="text"
                        placeholder={t('auth.username_placeholder')}
                        className="form-input"
                        style={{
                            paddingLeft: '2.5rem',
                            borderColor: (showErrors && !username) || isUsernameValid === false ? 'var(--danger)' : isUsernameValid === true ? 'var(--primary)' : undefined
                        }}
                        value={username}
                        onChange={(e) => setField('username', e.target.value)}
                        onBlur={() => onBlur('username', username)}
                        aria-invalid={isUsernameValid === false ? "true" : "false"}
                        aria-describedby="username-error"
                    />
                    {isUsernameValid === true && <CheckCircle size={20} color="var(--primary)" className="input-status-icon" aria-hidden="true" />}
                    {isUsernameValid === false && <AlertCircle size={20} color="var(--danger)" className="input-status-icon" aria-hidden="true" />}
                </div>
                {showErrors && !username && <p id="username-required" className="error-message" role="alert">{t('auth.field_required')}</p>}
                {isUsernameValid === false && <p id="username-error" className="error-message" role="alert">{usernameApiError || t('auth.username_error')}</p>}
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="email">
                    {t('auth.email')} <span className="student-email-hint">({accountType === 'student' ? '@emsi-edu.ma' : '@emsi.ma'})</span>
                </label>
                <div className="input-wrapper">
                    <Mail size={20} className="input-icon" aria-hidden="true" />
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setField('email', e.target.value)}
                        onBlur={() => onBlur('email', email)}
                        placeholder={accountType === 'student' ? t('auth.student_placeholder') : t('auth.professor_placeholder')}
                        className="form-input"
                        style={{
                            paddingRight: '2.5rem',
                            borderColor: (showErrors && !email) || isEmailValid === false ? '#EF4444' : isEmailValid === true ? '#10B981' : undefined
                        }}
                        aria-invalid={isEmailValid === false ? "true" : "false"}
                        aria-describedby="email-error"
                    />
                    {isEmailValid === true && <CheckCircle size={20} color="#10B981" className="input-status-icon" aria-hidden="true" />}
                    {isEmailValid === false && <AlertCircle size={20} color="#EF4444" className="input-status-icon" aria-hidden="true" />}
                </div>
                {showErrors && !email && <p className="error-message" role="alert">{t('auth.field_required')}</p>}
                {isEmailValid === false && (
                    <p id="email-error" className="error-message" role="alert">
                        {emailApiError ? emailApiError : (
                            <>
                                {t('auth.email_error')} <strong>{accountType === 'student' ? '@emsi-edu.ma' : '@emsi.ma'}</strong>
                            </>
                        )}
                    </p>
                )}
            </div>
        </>
    );
};

export default RegisterStep2;
