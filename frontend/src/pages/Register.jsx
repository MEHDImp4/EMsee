import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';

const Register = () => {
    return (
        <div style={{ padding: '4rem 0', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container" style={{ width: '100%', maxWidth: '400px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--border-radius)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Rejoignez-nous</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Créez votre compte EMSI dès maintenant.</p>
                    </div>

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nom complet</label>
                            <div style={{ position: 'relative' }}>
                                <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid var(--text-muted)',
                                        background: 'transparent',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid var(--text-muted)',
                                        background: 'transparent',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Mot de passe</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid var(--text-muted)',
                                        background: 'transparent',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>S'inscrire</button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Déjà un compte ? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Se connecter</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
