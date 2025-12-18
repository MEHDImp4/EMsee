import { useState, useEffect } from 'react';

const initialValidation = {
    isEmailValid: null,
    isUsernameValid: null,
    isPasswordValid: null,
    doPasswordsMatch: null,
    passwordCriteria: {
        hasLength: false,
        hasUpper: false,
        hasLower: false,
        hasDigit: false
    }
};

const initialErrors = {
    general: '',
    emailApiError: '',
    usernameApiError: '',
    passwordError: '',
    emailError: ''
};

const useRegisterValidation = (form) => {
    const [validation, setValidation] = useState(initialValidation);
    const [errors, setErrors] = useState(initialErrors);

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
        const hasLower = /[a-z]/.test(value);
        const hasDigit = /[0-9]/.test(value);
        const isValid = hasLength && hasUpper && hasLower && hasDigit;

        setValidation(prev => ({
            ...prev,
            isPasswordValid: isValid,
            passwordCriteria: {
                hasLength,
                hasUpper,
                hasLower,
                hasDigit
            }
        }));

        if (!hasLength) {
            setErrors(prev => ({ ...prev, passwordError: 'Le mot de passe est petit (minimum 6 caractères)' }));
        } else if (!hasUpper) {
            setErrors(prev => ({ ...prev, passwordError: 'Le mot de passe doit contenir une majuscule' }));
        } else if (!hasLower) {
            setErrors(prev => ({ ...prev, passwordError: 'Le mot de passe doit contenir une minuscule' }));
        } else if (!hasDigit) {
            setErrors(prev => ({ ...prev, passwordError: 'Le mot de passe doit contenir un chiffre' }));
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

    return {
        validation,
        setValidation,
        errors,
        setErrors,
        applyAvailabilityError,
        clearAvailabilityError
    };
};

export default useRegisterValidation;
