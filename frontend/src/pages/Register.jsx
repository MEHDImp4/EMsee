import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './css/Register.css';

// Import Wizard Steps
import RegisterStep1 from '../components/register/RegisterStep1';
import RegisterStep2 from '../components/register/RegisterStep2';
import RegisterStep3 from '../components/register/RegisterStep3';
import RegisterStep4 from '../components/register/RegisterStep4';

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
                    className="auth-card auth-card-full"
                >
                    <div className="auth-header auth-header-relative">
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                className="wizard-back-btn"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <h1 className="auth-title auth-title-large">
                            {currentStep === 1 ? t('auth.join_us') : t('auth.create_account')}
                        </h1>
                        <p className="auth-subtitle auth-subtitle-small">
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

                    <form className="auth-form auth-form-flex">
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
                                    <RegisterStep1
                                        accountType={accountType}
                                        setAccountType={setAccountType}
                                    />
                                )}

                                {currentStep === 2 && (
                                    <RegisterStep2
                                        fullName={fullName} setFullName={setFullName}
                                        username={username} setUsername={setUsername}
                                        email={email} setEmail={setEmail}
                                        accountType={accountType}
                                        showErrors={showErrors}
                                        isUsernameValid={isUsernameValid}
                                        isEmailValid={isEmailValid}
                                    />
                                )}

                                {currentStep === 3 && (
                                    <RegisterStep3
                                        isProfessor={isProfessor}
                                        availableSubjects={AVAILABLE_SUBJECTS}
                                        selectedSubjects={selectedSubjects}
                                        toggleSubject={toggleSubject}
                                        showErrors={showErrors}
                                    />
                                )}

                                {currentStep === 4 && (
                                    <RegisterStep4
                                        password={password} setPassword={setPassword}
                                        confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                                        isPasswordValid={isPasswordValid}
                                        doPasswordsMatch={doPasswordsMatch}
                                        showErrors={showErrors}
                                        showPassword={showPassword} setShowPassword={setShowPassword}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="wizard-footer wizard-footer-gap">
                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-full-width btn-center-icon"
                                    onClick={handleNext}
                                >
                                    {t('next')} <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-full-width"
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

