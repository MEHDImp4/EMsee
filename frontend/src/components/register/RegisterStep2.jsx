
import React from 'react';
import { User, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RegisterStep2 = ({
    fullName, setFullName,
    username, setUsername,
    email, setEmail,
    accountType,
    showErrors,
    isUsernameValid,
    isEmailValid
}) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="form-group">
                <label className="form-label">{t('auth.full_name')}</label>
                <div className="input-wrapper">
                    <User size={20} className="input-icon" />
                    <input
                        type="text"
                        placeholder={t('auth.fullname_placeholder', 'John Doe')}
                        className="form-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoFocus
                        style={{ borderColor: showErrors && !fullName ? 'var(--danger)' : undefined }}
                    />
                </div>
                {showErrors && !fullName && <p className="error-message">{t('auth.field_required')}</p>}
            </div>

            <div className="form-group">
                <label className="form-label">{t('auth.username')}</label>
                <div className="input-wrapper">
                    <span className="input-prefix">@</span>
                    <input
                        type="text"
                        placeholder={t('auth.username_placeholder')}
                        className="form-input"
                        style={{
                            paddingLeft: '2.5rem',
                            borderColor: (showErrors && !username) || isUsernameValid === false ? 'var(--danger)' : isUsernameValid === true ? 'var(--primary)' : undefined
                        }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {isUsernameValid === true && <CheckCircle size={20} color="var(--primary)" className="input-status-icon" />}
                    {isUsernameValid === false && <AlertCircle size={20} color="var(--danger)" className="input-status-icon" />}
                </div>
                {showErrors && !username && <p className="error-message">{t('auth.field_required')}</p>}
                {isUsernameValid === false && <p className="error-message">{t('auth.username_error')}</p>}
            </div>

            <div className="form-group">
                <label className="form-label">
                    {t('auth.email')} <span className="student-email-hint">({accountType === 'student' ? '@emsi-edu.ma' : '@emsi.ma'})</span>
                </label>
                <div className="input-wrapper">
                    <Mail size={20} className="input-icon" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={accountType === 'student' ? t('auth.student_placeholder') : t('auth.professor_placeholder')}
                        className="form-input"
                        style={{
                            paddingRight: '2.5rem',
                            borderColor: (showErrors && !email) || isEmailValid === false ? '#EF4444' : isEmailValid === true ? '#10B981' : undefined
                        }}
                    />
                    {isEmailValid === true && <CheckCircle size={20} color="#10B981" className="input-status-icon" />}
                    {isEmailValid === false && <AlertCircle size={20} color="#EF4444" className="input-status-icon" />}
                </div>
                {showErrors && !email && <p className="error-message">{t('auth.field_required')}</p>}
                {isEmailValid === false && (
                    <p className="error-message">
                        {t('auth.email_error')} <strong>{accountType === 'student' ? '@emsi-edu.ma' : '@emsi.ma'}</strong>
                    </p>
                )}
            </div>
        </>
    );
};

export default RegisterStep2;
