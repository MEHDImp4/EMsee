import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import './Login.css';

const Login = () => {
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
                        <h1 className="auth-title">Bon retour !</h1>
                        <p className="auth-subtitle">Connectez-vous pour accéder à votre feed.</p>
                    </div>

                    <form className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    className="form-input"
                                />
                            </div>
                        </div>

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

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Se connecter</button>
                    </form>

                    <div className="auth-footer">
                        Pas encore de compte ? <Link to="/register" className="auth-link">Créer un compte</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
