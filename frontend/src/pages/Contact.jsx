
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Send, CheckCircle, User, MessageSquare } from 'lucide-react';

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
                                role="status"
                                aria-live="polite"
                            >
                                <CheckCircle size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} aria-hidden="true" />
                                <h3 className="success-title">{t('contact_page.success_message')}</h3>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-group">
                                    <label className="contact-label" htmlFor="name">{t('contact_page.name')}</label>
                                    <div className="input-wrapper">
                                        <User size={20} className="input-icon" aria-hidden="true" />
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="contact-input with-icon"
                                            autoComplete="name"
                                            placeholder={t('contact_page.name')}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="contact-label" htmlFor="email">{t('contact_page.email')}</label>
                                    <div className="input-wrapper">
                                        <Mail size={20} className="input-icon" aria-hidden="true" />
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="contact-input with-icon"
                                            autoComplete="email"
                                            placeholder={t('contact_page.email')}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="contact-label" htmlFor="message">{t('contact_page.message')}</label>
                                    <div className="input-wrapper textarea-wrapper">
                                        <MessageSquare size={20} className="input-icon textarea-icon" aria-hidden="true" />
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            className="contact-input contact-textarea with-icon"
                                            placeholder={t('contact_page.message')}
                                        ></textarea>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary contact-btn">
                                    <Send size={20} aria-hidden="true" />
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
