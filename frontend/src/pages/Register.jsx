import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './css/Register.css';

// Import Wizard Steps
import RegisterStep1 from '../components/register/RegisterStep1';
import RegisterStep2 from '../components/register/RegisterStep2';
import RegisterStep3 from '../components/register/RegisterStep3';
import RegisterStep4 from '../components/register/RegisterStep4';

const Register = () => {
    const { t } = useTranslation();
    const { loginAction } = useAuth();
    const navigate = useNavigate();

    // Wizard State
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const [showErrors, setShowErrors] = useState(false);
    const [generalError, setGeneralError] = useState(''); // New state for non-field specific errors

    // Form Data
    const [accountType, setAccountType] = useState('student');
    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(null);
    const [emailApiError, setEmailApiError] = useState(''); // New state for API errors
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [isUsernameValid, setIsUsernameValid] = useState(null);
    const [usernameApiError, setUsernameApiError] = useState(''); // New state for API errors
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(null);
    const [doPasswordsMatch, setDoPasswordsMatch] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Professor Data
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    // Student Data
    const [filiere, setFiliere] = useState('');
    const [year, setYear] = useState('');

    // Derived State
    const isProfessor = accountType === 'professor';

    const AVAILABLE_SUBJECTS = [
        'web_dev', 'java', 'algo', 'data_struct',
        'db', 'networks', 'os', 'project_mgmt',
        'math', 'probs', 'english', 'comm'
    ];

    const FILIERES_WITH_PREPA = [
        'iir',
        'gesi',
        'iaii',
        'gi'
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
        setUsernameApiError(''); // Clear API error on change
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
        setEmailApiError(''); // Clear API error on change
        if (!value) {
            setIsEmailValid(null);
            return;
        }
        const domain = type === 'student' ? '@emsi-edu.ma' : '@emsi.ma';
        setIsEmailValid(value.endsWith(domain));
    };

    // Step Validation Logic
    const checkFieldAvailability = async (field, value) => {
        if (!value) return;

        try {
            const payload = {};
            payload[field] = value;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.field === 'email' && field === 'email') {
                    setIsEmailValid(false);
                    setEmailApiError(data.error);
                } else if (data.field === 'username' && field === 'username') {
                    setIsUsernameValid(false);
                    setUsernameApiError(data.error);
                }
            } else {
                // If available, ensure we keep the valid state (regex check passed previously)
                if (field === 'username') {
                    // Re-run regex check to be safe, or assume regex passed if we got here
                    // Actually, valid regex is pre-requisite? 
                    // Let's just clear API error. The local validation (regex) runs on change.
                    setUsernameApiError('');
                }
                if (field === 'email') {
                    setEmailApiError('');
                }
            }
        } catch (error) {
            console.error("Field availability check failed", error);
            // Don't block flow on blur error, just log
        }
    };

    const handleBlur = (field, value) => {
        if (field === 'username' && isUsernameValid !== false) { // Only check if format is valid or neutral
            checkFieldAvailability('username', value);
        }
        if (field === 'email' && isEmailValid !== false) {
            checkFieldAvailability('email', value);
        }
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return true;
            case 2:
                return fullName.trim() !== '' && isUsernameValid && isEmailValid;
            case 3:
                if (isProfessor) {
                    return selectedSubjects.length > 0;
                } else {
                    if (!filiere) return false;
                    return year !== '';
                }
            case 4:
                return isPasswordValid && doPasswordsMatch;
            default:
                return false;
        }
    };

    const handleNext = async () => {
        if (validateCurrentStep()) {
            // Check availability for Step 2
            // Check availability for Step 2
            if (currentStep === 2) {
                // If we already have API errors, don't proceed
                if (usernameApiError || emailApiError) {
                    return;
                }

                // Double check if we haven't checked yet (e.g. user typed fast and clicked next)
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-availability`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, username })
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        if (data.field === 'email') {
                            setIsEmailValid(false);
                            setEmailApiError(data.error);
                        } else if (data.field === 'username') {
                            setIsUsernameValid(false);
                            setUsernameApiError(data.error);
                        } else {
                            setGeneralError(data.error);
                        }
                        return; // Stop here
                    }
                } catch (error) {
                    console.error("Availability check failed", error);
                    setGeneralError(t('auth.check_failed', 'Unable to verify availability. Please check your connection or try again later.'));
                    return;
                }
            }

            setGeneralError(''); // Clear error if successful

            setShowErrors(false);
            setGeneralError('');
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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault(); // Handle explicit event if passed
        if (validateCurrentStep()) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        username,
                        password,
                        full_name: fullName,
                        role: accountType,
                        filiere: accountType === 'student' ? filiere : undefined,
                        year: accountType === 'student' ? year : undefined,
                        subjects: accountType === 'professor' ? selectedSubjects : undefined
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Auto login using context action
                    loginAction(data.user, data.token);

                    if (isProfessor) {
                        localStorage.setItem('professorSubjects', JSON.stringify(selectedSubjects));
                    } else {
                        localStorage.setItem('studentFiliere', filiere);
                        localStorage.setItem('studentYear', year);
                    }

                    navigate('/feed');
                } else {
                    console.error('Registration failed:', data.error);
                    // You might want to show this error to the user
                    alert(data.error || 'Registration failed');
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('An error occurred. Please try again.');
            }
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
                                type="button"
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

                    <form
                        className="auth-form auth-form-flex"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (currentStep === totalSteps) {
                                handleSubmit(e);
                            } else {
                                handleNext();
                            }
                        }}
                    >
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
                                        usernameApiError={usernameApiError} // Pass error
                                        emailApiError={emailApiError}       // Pass error
                                        onBlur={handleBlur}
                                    />
                                )}

                                {currentStep === 3 && (
                                    <RegisterStep3
                                        isProfessor={isProfessor}
                                        availableSubjects={AVAILABLE_SUBJECTS}
                                        selectedSubjects={selectedSubjects}
                                        toggleSubject={toggleSubject}
                                        filiere={filiere}
                                        setFiliere={setFiliere}
                                        year={year}
                                        setYear={setYear}
                                        FILIERES_WITH_PREPA={FILIERES_WITH_PREPA}
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

                        {generalError && (
                            <div className="error-message-container" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <p className="error-message" role="alert" style={{ fontSize: '0.9rem' }}>
                                    {generalError}
                                </p>
                            </div>
                        )}

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

