import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import useRegisterForm from '../hooks/useRegisterForm';
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

    const {
        currentStep,
        totalSteps,
        progressPercentage,
        form,
        validation,
        errors,
        showErrors,
        handleNext,
        handleBack,
        handleSubmit,
        handleBlur,
        setField,
        toggleSubject,
        isProfessor,
        options
    } = useRegisterForm({ loginAction, navigate, t });

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
                                        accountType={form.accountType}
                                        setAccountType={(value) => setField('accountType', value)}
                                    />
                                )}

                                {currentStep === 2 && (
                                    <RegisterStep2
                                        form={form}
                                        setField={setField}
                                        validation={validation}
                                        errors={errors}
                                        showErrors={showErrors}
                                        onBlur={handleBlur}
                                    />
                                )}

                                {currentStep === 3 && (
                                    <RegisterStep3
                                        isProfessor={isProfessor}
                                        form={form}
                                        setField={setField}
                                        toggleSubject={toggleSubject}
                                        options={options}
                                        showErrors={showErrors}
                                    />
                                )}

                                {currentStep === 4 && (
                                    <RegisterStep4
                                        form={form}
                                        setField={setField}
                                        validation={validation}
                                        showErrors={showErrors}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {errors.general && (
                            <div className="error-message-container" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <p className="error-message" role="alert" style={{ fontSize: '0.9rem' }}>
                                    {errors.general}
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

