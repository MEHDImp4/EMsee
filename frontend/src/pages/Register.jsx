import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, GraduationCap, School, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import './Register.css';

const Register = () => {
    const [accountType, setAccountType] = useState('student'); // 'student' | 'professor'
    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(null);

    useEffect(() => {
        validateEmail(email, accountType);
    }, [email, accountType]);

    const validateEmail = (value, type) => {
        if (!value) {
            setIsEmailValid(null);
            return;
        }
        const domain = type === 'student' ? '@emsi-edu.ma' : '@emsi.ma';
        setIsEmailValid(value.endsWith(domain));
    };

    return (
        <div className="auth-page">
            <div className="container auth-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="auth-card"
                >
                    <div className="auth-header">
                        <h1 className="auth-title">Rejoignez-nous</h1>
                        <p className="auth-subtitle">Créez votre compte EMSI dès maintenant.</p>
                    </div>

                    {/* Account Type Selector */}
                    <div className="account-type-selector">
                        <button
                            type="button"
                            onClick={() => setAccountType('student')}
                            className={`type-btn ${accountType === 'student' ? 'active' : ''}`}
                        >
                            <GraduationCap size={18} />
                            Étudiant
                        </button>
                        <button
                            type="button"
                            onClick={() => setAccountType('professor')}
                            className={`type-btn ${accountType === 'professor' ? 'active' : ''}`}
                        >
                            <BookOpen size={18} />
                            Professeur
                        </button>
                    </div>

                    <form className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Nom complet</label>
                            <div className="input-wrapper">
                                <User size={20} className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Email <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({accountType === 'student' ? '@emsi-edu.ma' : '@emsi.ma'})</span>
                            </label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={accountType === 'student' ? "etudiant@emsi-edu.ma" : "prof@emsi.ma"}
                                    className="form-input"
                                    style={{
                                        paddingRight: '2.5rem',
                                        borderColor: isEmailValid === false ? '#EF4444' : isEmailValid === true ? '#10B981' : undefined
                                    }}
                                />
                                {isEmailValid === true && <CheckCircle size={20} color="#10B981" className="input-status-icon" />}
                                {isEmailValid === false && <AlertCircle size={20} color="#EF4444" className="input-status-icon" />}
                            </div>
                            {isEmailValid === false && (
                                <p className="error-message">
                                    L'email doit se terminer par <strong>{accountType === 'student' ? '@emsi-edu.ma' : '@emsi.ma'}</strong>
                                </p>
                            )}
                        </div>

                        {accountType === 'student' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="student-fields"
                            >
                                <div className="form-group">
                                    <label className="form-label">Niveau d'étude</label>
                                    <div className="input-wrapper">
                                        <GraduationCap size={20} className="input-icon" />
                                        <select className="form-input" style={{ appearance: 'none' }}>
                                            <option value="">Sélectionner un niveau</option>
                                            <option value="1ap">1ère année prépa</option>
                                            <option value="2ap">2ème année prépa</option>
                                            <option value="3iir">3ème année IIR</option>
                                            <option value="4iir">4ème année IIR</option>
                                            <option value="5iir">5ème année IIR</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Classe</label>
                                    <div className="input-wrapper">
                                        <School size={20} className="input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Ex: G1, G2..."
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Mot de passe</label>
                            <div className="input-wrapper">
                                <Lock size={20} className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isEmailValid === false}>
                            S'inscrire
                        </button>
                    </form>

                    <div className="auth-footer">
                        Déjà un compte ? <Link to="/login" className="auth-link">Se connecter</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
