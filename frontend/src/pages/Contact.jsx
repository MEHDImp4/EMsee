
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Send, CheckCircle } from 'lucide-react';

import './css/Contact.css';

const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setTimeout(() => {
            setSubmitted(true);
            setFormData({ name: '', email: '', message: '' });
        }, 1000);
    };

    return (
        <section className="contact-section">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="contact-container-wrapper"
                >
                    <div className="contact-header">
                        <div className="contact-icon-wrapper">
                            <Mail size={32} />
                        </div>
                        <h1 className="contact-title">{t('contact_page.title')}</h1>
                        <p className="contact-subtitle">{t('contact_page.subtitle')}</p>
                    </div>

                    <div className="card contact-card">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="success-message"
                            >
                                <CheckCircle size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                <h3 className="success-title">{t('contact_page.success_message')}</h3>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div>
                                    <label className="contact-label">{t('contact_page.name')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="contact-input"
                                    />
                                </div>
                                <div>
                                    <label className="contact-label">{t('contact_page.email')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="contact-input"
                                    />
                                </div>
                                <div>
                                    <label className="contact-label">{t('contact_page.message')}</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="contact-input contact-textarea"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary contact-btn">
                                    <Send size={20} />
                                    {t('contact_page.send')}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Contact;
