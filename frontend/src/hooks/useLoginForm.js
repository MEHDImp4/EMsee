import { useState } from 'react';

const useLoginForm = ({ login, navigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!email) newErrors.email = true;
        if (!password) newErrors.password = true;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const success = await login(email, password);
            if (success) {
                navigate('/feed');
            } else {
                setErrors({ form: 'Identifiants incorrects' });
            }
        } catch (error) {
            const msg = error.message || 'Une erreur est survenue. Veuillez réessayer.';
            setErrors({ form: msg });
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        errors,
        setErrors,
        handleSubmit
    };
};

export default useLoginForm;
