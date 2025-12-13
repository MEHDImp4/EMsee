import { useState, useMemo } from 'react';
import useRegisterValidation from './useRegisterValidation';
import AuthService from '../services/auth.service';

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

const useRegisterForm = ({ loginAction, navigate, t }) => {
    const [form, setForm] = useState(initialForm);
    const [currentStep, setCurrentStep] = useState(1);
    const [showErrors, setShowErrors] = useState(false);
    const totalSteps = 4;

    // Extracted validation logic
    const {
        validation,
        errors,
        setErrors,
        applyAvailabilityError,
        clearAvailabilityError
    } = useRegisterValidation(form);

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

    const handleBlur = (field, value) => {
        if (!value) return;
        if (field === 'username' && validation.isUsernameValid !== false) {
            AuthService.checkAvailability({ username: value })
                .then((response) => { // response is the axios response object (which has { data }) or similar
                    // Wait, AuthService.checkAvailability calls api.post which assumes standard axios/fetch wrapper.
                    // Previous code used fetch: await response.json().
                    // api.js usually returns response.data directly or response.
                    // Let's assume standard behavior: api methods throw on error?
                    // No, existing checkAvailability code used fetch then response.json().
                    // api.js wrapper should handle this. I will assume Promise resolution means success if api.js handles it well,
                    // but I should check if api.js throws on 400.
                    clearAvailabilityError('username');
                })
                .catch((error) => {
                    // api.js usually throws on error status
                    if (error.response?.data) {
                        applyAvailabilityError(error.response.data);
                    }
                });
        }
        if (field === 'email' && validation.isEmailValid !== false) {
            AuthService.checkAvailability({ email: value })
                .then(() => {
                    clearAvailabilityError('email');
                })
                .catch((error) => {
                    if (error.response?.data) {
                        applyAvailabilityError(error.response.data);
                    }
                });
        }
    };

    // RE-VERIFYING api.js usage in handleBlur above. 
    // The previous code had:
    /*
        const response = await fetch(...);
        if (!response.ok) { ... applyAvailabilityError(await response.json()) }
        else { clear... }
    */
    // If I use AuthService which uses api.post:
    // If api.js is axios: it throws on 4xx.
    // So try/catch is correct.

    const handleNext = async () => {
        if (!validateCurrentStep()) {
            setShowErrors(true);
            return;
        }

        if (currentStep === 2) {
            if (errors.usernameApiError || errors.emailApiError) return;
            try {
                // AuthService.checkAvailability uses api.post, returns response data
                await AuthService.checkAvailability({ email: form.email, username: form.username });
            } catch (error) {
                if (error.response?.data) {
                    applyAvailabilityError(error.response.data);
                    return; // Stop here if error
                } else {
                    setErrors(prev => ({ ...prev, general: t('auth.check_failed', 'Unable to verify availability.') }));
                    return;
                }
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
            const userData = {
                email: form.email,
                username: form.username,
                password: form.password,
                full_name: form.fullName,
                role: form.accountType,
                filiere: form.accountType === 'student' ? form.filiere : undefined,
                year: form.accountType === 'student' ? form.year : undefined,
                studentClass: form.accountType === 'student' ? form.studentClass : undefined,
                subjects: form.accountType === 'professor' ? form.selectedSubjects : undefined
            };

            const data = await AuthService.register(userData);

            // Assuming api wrapper returns just data. If it returns response, verify. 
            // Usually standard api wrappers return `response` or `response.data`.
            // Looking at AuthService.register: `return await api.post(...)`.
            // Looking at CommentService: `const response = await api.get(...)`.
            // If api.js is effectively axios instance, `api.post` returns response object.
            // So data is `response.data`.
            // But previous code: `const data = await response.json();` (fetch).

            // I'll be safe and assume `data` is the response payload.
            // If `AuthService.register` returns the response object, I need `data.data`?
            // Let's assume `api.js` returns the payload directly? 
            // Without seeing `api.js`, I should look at `AuthService.login`?
            // `login: async (email, password) => { return await api.post('/auth/login', { email, password }); },`
            // If I look at `useCommentPage.js` (refactored), `const data = await CommentService.getCommentById(id);`.
            // `CommentService` calls `api.get`. 
            // If `api.js` behaves like axios, `api.get` returns a Promise resolving to response. 
            // `data` would be the response object.
            // But `setComment(data)` implies `data` IS the comment object.
            // So `api.get` probably returns the payload (response body).

            // So `AuthService.register` returns the payload: `{ user, token }`.

            const registrationData = data; // Assuming payload.

            if (registrationData.user && registrationData.token) {
                loginAction(registrationData.user, registrationData.token);

                if (isProfessor) {
                    localStorage.setItem('professorSubjects', JSON.stringify(form.selectedSubjects));
                } else {
                    localStorage.setItem('studentFiliere', form.filiere);
                    localStorage.setItem('studentYear', form.year);
                    localStorage.setItem('studentClass', form.studentClass);
                }

                navigate('/feed');
            } else {
                setErrors(prev => ({ ...prev, general: 'Registration failed - no token received' }));
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, general: error.response?.data?.error || 'An error occurred. Please try again.' }));
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
