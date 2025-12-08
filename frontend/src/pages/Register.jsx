import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, GraduationCap, School, CheckCircle, AlertCircle, BookOpen, Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './css/Register.css';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Wizard State
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const [showErrors, setShowErrors] = useState(false);

    // Form Data
    const [accountType, setAccountType] = useState('student');
    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(null);
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [isUsernameValid, setIsUsernameValid] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(null);
    const [doPasswordsMatch, setDoPasswordsMatch] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Professor Data
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    // Derived State
    const isProfessor = accountType === 'professor';

    const AVAILABLE_SUBJECTS = [
        'Développement Web', 'Java / J2EE', 'Algorithmique', 'Structure de données',
        'Bases de données', 'Réseaux', 'Systèmes d\'exploitation', 'Gestion de projet',
        'Mathématiques', 'Probabilités', 'Anglais', 'Communication'
    ];

    useEffect(() => {
        validateEmail(email, accountType);
    }, [email, accountType]);

    useEffect(() => {
        validateUsername(username);
    }, [username]);

    useEffect(() => {
        validatePassword(password);
        if (confirmPassword) {
            setDoPasswordsMatch(password === confirmPassword);
        }
    }, [password, confirmPassword]);

    const validateUsername = (value) => {
        if (!value) {
            setIsUsernameValid(null);
            return;
        }
        const regex = /^[a-z0-9.]+$/;
        setIsUsernameValid(regex.test(value));
    };

    const validatePassword = (value) => {
        if (!value) {
            setIsPasswordValid(null);
            return;
        }
        const hasLength = value.length >= 8;
        const hasUpper = /[A-Z]/.test(value);
        setIsPasswordValid(hasLength && hasUpper);
    };

    const validateEmail = (value, type) => {
        if (!value) {
            setIsEmailValid(null);
            return;
        }
        const domain = type === 'student' ? '@emsi-edu.ma' : '@emsi.ma';
        setIsEmailValid(value.endsWith(domain));
    };

    // Step Validation Logic
    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return true;
            case 2:
                return fullName.trim() !== '' && isUsernameValid && isEmailValid;
            case 3:
                return isProfessor ? selectedSubjects.length > 0 : true; // Require at least one subject for profs
            case 4:
                return isPasswordValid && doPasswordsMatch;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            setShowErrors(false);
            if (currentStep < totalSteps) {
                setCurrentStep(prev => prev + 1);
            }
        } else {
            setShowErrors(true);
        }
    };

    const handleBack = () => {
        setShowErrors(false);
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const toggleSubject = (subject) => {
        setSelectedSubjects(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateCurrentStep()) {
            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('userEmail', email || 'user@example.com');
            localStorage.setItem('userName', fullName || 'New User');
            localStorage.setItem('userHandle', username || 'user');
            localStorage.setItem('firstVisit', 'true');
            if (isProfessor) {
                localStorage.setItem('professorSubjects', JSON.stringify(selectedSubjects));
            }
            navigate('/feed');
        } else {
            setShowErrors(true);
        }
    };

    // Progress Bar
    const progressPercentage = ((currentStep - 1) / 3) * 100; // Always 4 steps now

    return (
        <div className="auth-page">
            <div className="container auth-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="auth-card"
                    style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}
                >
                    <div className="auth-header" style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                className="wizard-back-btn"
                                style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <h1 className="auth-title" style={{ fontSize: '1.5rem', margin: 0 }}>
                            {currentStep === 1 ? t('auth.join_us') : t('auth.create_account')}
                        </h1>
                        <p className="auth-subtitle" style={{ fontSize: '0.9rem' }}>
                            {t('step')} {currentStep} / {totalSteps}
                        </p>
                    </div>

                    <div className="wizard-progress-container">
                        <motion.div
                            className="wizard-progress-bar"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    <form className="auth-form" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ flex: 1 }}
                            >
                                {currentStep === 1 && (
                                    <div className="account-type-selector" style={{ flexDirection: 'column', gap: '1rem', background: 'transparent', padding: 0 }}>
                                        <button
                                            type="button"
                                            onClick={() => setAccountType('student')}
                                            className={`type-btn-large ${accountType === 'student' ? 'active' : ''}`}
                                        >
                                            <div className="icon-box"><GraduationCap size={32} /></div>
                                            <div>
                                                <h3>{t('auth.student')}</h3>
                                                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>@emsi-edu.ma</p>
                                            </div>
                                            {accountType === 'student' && <CheckCircle className="check-icon" size={24} />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAccountType('professor')}
                                            className={`type-btn-large ${accountType === 'professor' ? 'active' : ''}`}
                                        >
                                            <div className="icon-box"><BookOpen size={32} /></div>
                                            <div>
                                                <h3>{t('auth.professor')}</h3>
                                                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>@emsi.ma</p>
                                            </div>
                                            {accountType === 'professor' && <CheckCircle className="check-icon" size={24} />}
                                        </button>
                                    </div>
                                )}

                                {currentStep === 2 && (
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
                                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>@</span>
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
                                                {t('auth.email')} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({accountType === 'student' ? '@emsi-edu.ma' : '@emsi.ma'})</span>
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
                                )}

                                {currentStep === 3 && (
                                    <>
                                        {!isProfessor ? (
                                            <div className="student-fields">
                                                <div className="form-group">
                                                    <label className="form-label">{t('auth.study_level')}</label>
                                                    <div className="input-wrapper">
                                                        <GraduationCap size={20} className="input-icon" />
                                                        <select className="form-input" style={{ appearance: 'none' }}>
                                                            <option value="">{t('auth.select_level')}</option>
                                                            <option value="1ap">{t('auth.year_1_prepa')}</option>
                                                            <option value="2ap">{t('auth.year_2_prepa')}</option>
                                                            <option value="3iir">{t('auth.year_3_iir')}</option>
                                                            <option value="4iir">{t('auth.year_4_iir')}</option>
                                                            <option value="5iir">{t('auth.year_5_iir')}</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">{t('auth.class')}</label>
                                                    <div className="input-wrapper">
                                                        <School size={20} className="input-icon" />
                                                        <input
                                                            type="text"
                                                            placeholder={t('auth.class_placeholder', 'Ex: G1, G2...')}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="professor-fields">
                                                <label className="form-label">{t('auth.subjects_taught')}</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                                                    {AVAILABLE_SUBJECTS.map(subject => (
                                                        <button
                                                            key={subject}
                                                            type="button"
                                                            onClick={() => toggleSubject(subject)}
                                                            className={`subject-badge ${selectedSubjects.includes(subject) ? 'active' : ''}`}
                                                            style={{
                                                                padding: '0.6rem 0.5rem',
                                                                borderRadius: '8px',
                                                                border: selectedSubjects.includes(subject) ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                                background: selectedSubjects.includes(subject) ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--bg-card)',
                                                                color: selectedSubjects.includes(subject) ? 'var(--primary)' : 'var(--text-muted)',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                fontWeight: selectedSubjects.includes(subject) ? '600' : '500',
                                                                transition: 'all 0.2s',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {subject}
                                                        </button>
                                                    ))}
                                                </div>
                                                {showErrors && selectedSubjects.length === 0 && (
                                                    <p className="error-message" style={{ marginTop: '1rem' }}>{t('auth.select_at_least_one')}</p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {currentStep === 4 && (
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
                                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
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
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="wizard-footer" style={{ marginTop: '2rem' }}>
                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={handleNext}
                                >
                                    {t('next')} <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={handleSubmit}
                                >
                                    {t('auth.register_btn')}
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="auth-footer">
                        {t('auth.already_account')} <Link to="/login" className="auth-link">{t('auth.login_btn')}</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
