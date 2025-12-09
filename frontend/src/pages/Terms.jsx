import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, Book, Scale, AlertCircle, FileText } from 'lucide-react';
import './css/Terms.css';

const Terms = () => {
    const { t } = useTranslation();

    const sections = [
        { key: 'intro', icon: <Book size={24} /> },
        { key: 'usage', icon: <Shield size={24} /> },
        { key: 'content', icon: <FileText size={24} /> },
        { key: 'termination', icon: <AlertCircle size={24} /> },
        { key: 'law', icon: <Scale size={24} /> }
    ];

    return (
        <section className="terms-section">
            <div className="terms-container-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="terms-header">
                        <h1 className="terms-title">{t('terms_page.title')}</h1>
                        <p className="terms-subtitle">{t('terms_page.last_updated')}: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="terms-card">
                        <div className="terms-content">
                            {sections.map((section, index) => (
                                <motion.div
                                    key={section.key}
                                    className="terms-block"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                >
                                    <h2 className="terms-heading">
                                        {section.icon}
                                        {t(`terms_page.sections.${section.key}.title`)}
                                    </h2>
                                    <p className="terms-text">
                                        {t(`terms_page.sections.${section.key}.content`)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Terms;
