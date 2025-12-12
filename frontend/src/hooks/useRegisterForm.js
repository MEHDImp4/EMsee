import { useEffect, useMemo, useState } from 'react';

export const AVAILABLE_SUBJECTS = [
    'web_dev', 'java', 'algo', 'data_struct',
    'db', 'networks', 'os', 'project_mgmt',
    'math', 'probs', 'english', 'comm'
];

export const FILIERES_WITH_PREPA = ['iir', 'gesi', 'iaii', 'gi'];

const initialForm = {
    accountType: 'student',
    email: '',
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    selectedSubjects: [],
    filiere: '',
    studentClass: '',
    year: '',
    showPassword: false
};

const initialValidation = {
    isEmailValid: null,
    isUsernameValid: null,
    isPasswordValid: null,
    doPasswordsMatch: null
};

const initialErrors = {
    general: '',
    emailApiError: '',
    usernameApiError: '',
    passwordError: '',
    emailError: ''
};

const useRegisterForm = ({ loginAction, navigate, t }) => {
    const [form, setForm] = useState(initialForm);
    const [validation, setValidation] = useState(initialValidation);
    const [errors, setErrors] = useState(initialErrors);
    const [showErrors, setShowErrors] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const isProfessor = form.accountType === 'professor';

    const setField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (field === 'email') {
            setErrors(prev => ({ ...prev, emailApiError: '', general: '' }));
        }
        if (field === 'username') {
            setErrors(prev => ({ ...prev, usernameApiError: '', general: '' }));
        }
    };

    useEffect(() => {
        validateEmail(form.email, form.accountType);
    }, [form.email, form.accountType]);

    useEffect(() => {
        validateUsername(form.username);
    }, [form.username]);

    useEffect(() => {
        validatePassword(form.password);
        if (form.confirmPassword) {
            setValidation(prev => ({ ...prev, doPasswordsMatch: form.password === form.confirmPassword }));
        } else {
            setValidation(prev => ({ ...prev, doPasswordsMatch: null }));
        }
    }, [form.password, form.confirmPassword]);

    const validateUsername = (value) => {
        if (!value) {
            setValidation(prev => ({ ...prev, isUsernameValid: null }));
            return;
        }
        const regex = /^[a-z0-9.]+$/;
        setValidation(prev => ({ ...prev, isUsernameValid: regex.test(value) }));
    };

    const validatePassword = (value) => {
        if (!value) {
            setValidation(prev => ({ ...prev, isPasswordValid: null }));
            setErrors(prev => ({ ...prev, passwordError: '' }));
            return;
        }
        const hasLength = value.length >= 6;
        const hasUpper = /[A-Z]/.test(value);
        const isValid = hasLength && hasUpper;

        setValidation(prev => ({ ...prev, isPasswordValid: isValid }));

        if (!hasLength) {
            setErrors(prev => ({ ...prev, passwordError: 'Le mot de passe est petit (minimum 6 caractères)' }));
        } else if (!hasUpper) {
            setErrors(prev => ({ ...prev, passwordError: 'Le mot de passe doit contenir une majuscule' }));
        } else {
            setErrors(prev => ({ ...prev, passwordError: '' }));
        }
    };

    const validateEmail = (value, type) => {
        if (!value) {
            setValidation(prev => ({ ...prev, isEmailValid: null }));
            return;
        }
        const domain = type === 'student' ? '@emsi-edu.ma' : '@emsi.ma';
        const isValid = value.endsWith(domain);
        setValidation(prev => ({ ...prev, isEmailValid: isValid }));

        if (!isValid) {
            setErrors(prev => ({ ...prev, emailError: "L'email n'est pas valable (doit finir par " + domain + ")" }));
        } else {
            setErrors(prev => ({ ...prev, emailError: '' }));
        }
    };

    const validateCurrentStep = () => {
        if (currentStep === 1) return true;
        if (currentStep === 2) {
            return form.fullName.trim() !== '' && validation.isUsernameValid && validation.isEmailValid;
        }
        if (currentStep === 3) {
            if (isProfessor) {
                return form.selectedSubjects.length > 0;
            }
            if (!form.filiere) return false;
            if (!form.year) return false;
            return !!form.studentClass;
        }
        if (currentStep === 4) {
            return validation.isPasswordValid && validation.doPasswordsMatch;
        }
        return false;
    };

    const applyAvailabilityError = (data) => {
        if (data.field === 'email') {
            setValidation(prev => ({ ...prev, isEmailValid: false }));
            setErrors(prev => ({ ...prev, emailApiError: data.error || '' }));
        } else if (data.field === 'username') {
            setValidation(prev => ({ ...prev, isUsernameValid: false }));
            setErrors(prev => ({ ...prev, usernameApiError: data.error || '' }));
        } else {
            setErrors(prev => ({ ...prev, general: data.error || '' }));
        }
    };

    const clearAvailabilityError = (field) => {
        if (field === 'email') {
            setErrors(prev => ({ ...prev, emailApiError: '' }));
        }
        if (field === 'username') {
            setErrors(prev => ({ ...prev, usernameApiError: '' }));
        }
    };

    const checkAvailability = async (payload) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return response;
    };

    const handleBlur = (field, value) => {
        if (!value) return;
        if (field === 'username' && validation.isUsernameValid !== false) {
            checkAvailability({ username: value })
                .then(async (response) => {
                    if (!response.ok) {
                        const data = await response.json();
                        applyAvailabilityError(data);
                    } else {
                        clearAvailabilityError('username');
                    }
                })
                .catch(() => {/* ignore blur errors */ });
        }
        if (field === 'email' && validation.isEmailValid !== false) {
            checkAvailability({ email: value })
                .then(async (response) => {
                    if (!response.ok) {
                        const data = await response.json();
                        applyAvailabilityError(data);
                    } else {
                        clearAvailabilityError('email');
                    }
                })
                .catch(() => {/* ignore blur errors */ });
        }
    };

    const handleNext = async () => {
        if (!validateCurrentStep()) {
            setShowErrors(true);
            return;
        }

        if (currentStep === 2) {
            if (errors.usernameApiError || errors.emailApiError) return;
            try {
                const response = await checkAvailability({ email: form.email, username: form.username });
                if (!response.ok) {
                    const data = await response.json();
                    applyAvailabilityError(data);
                    return;
                }
            } catch (error) {
                setErrors(prev => ({ ...prev, general: t('auth.check_failed', 'Unable to verify availability. Please try again later.') }));
                return;
            }
        }

        setErrors(prev => ({ ...prev, general: '' }));
        setShowErrors(false);
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setShowErrors(false);
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const toggleSubject = (subject) => {
        setForm(prev => ({
            ...prev,
            selectedSubjects: prev.selectedSubjects.includes(subject)
                ? prev.selectedSubjects.filter(s => s !== subject)
                : [...prev.selectedSubjects, subject]
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateCurrentStep()) {
            setShowErrors(true);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    username: form.username,
                    password: form.password,
                    full_name: form.fullName,
                    role: form.accountType,
                    filiere: form.accountType === 'student' ? form.filiere : undefined,
                    year: form.accountType === 'student' ? form.year : undefined,
                    studentClass: form.accountType === 'student' ? form.studentClass : undefined,
                    subjects: form.accountType === 'professor' ? form.selectedSubjects : undefined
                })
            });

            const data = await response.json();

            if (response.ok) {
                loginAction(data.user, data.token);

                if (isProfessor) {
                    localStorage.setItem('professorSubjects', JSON.stringify(form.selectedSubjects));
                } else {
                    localStorage.setItem('studentFiliere', form.filiere);
                    localStorage.setItem('studentYear', form.year);
                    localStorage.setItem('studentClass', form.studentClass);
                }

                navigate('/feed');
            } else {
                setErrors(prev => ({ ...prev, general: data.error || 'Registration failed' }));
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, general: 'An error occurred. Please try again.' }));
        }
    };

    const progressPercentage = useMemo(() => ((currentStep - 1) / 3) * 100, [currentStep]);

    return {
        currentStep,
        totalSteps,
        showErrors,
        form,
        validation,
        errors,
        progressPercentage,
        handleNext,
        handleBack,
        handleSubmit,
        handleBlur,
        setField,
        toggleSubject,
        isProfessor,
        options: {
            availableSubjects: AVAILABLE_SUBJECTS,
            filieresWithPrepa: FILIERES_WITH_PREPA
        }
    };
};

export default useRegisterForm;
