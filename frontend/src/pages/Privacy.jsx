import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Lock, Database, Eye, Shield, Cookie, UserCheck } from 'lucide-react';
import './css/Privacy.css';

const Privacy = () => {
    const { t } = useTranslation();

    const sections = [
        { key: 'collection', icon: <Database size={24} /> },
        { key: 'usage', icon: <UserCheck size={24} /> },
        { key: 'cookies', icon: <Cookie size={24} /> },
        { key: 'security', icon: <Lock size={24} /> },
        { key: 'rights', icon: <Eye size={24} /> }
    ];

    return (
        <section className="privacy-section">
            <div className="privacy-container-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="privacy-header">
                        <h1 className="privacy-title">{t('privacy_page.title')}</h1>
                        <p className="privacy-subtitle">{t('privacy_page.last_updated')}: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="privacy-card">
                        <div className="privacy-content">
                            {sections.map((section, index) => (
                                <motion.div
                                    key={section.key}
                                    className="privacy-block"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                >
                                    <h2 className="privacy-heading">
                                        {section.icon}
                                        {t(`privacy_page.sections.${section.key}.title`)}
                                    </h2>
                                    <p className="privacy-text">
                                        {t(`privacy_page.sections.${section.key}.content`)}
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

export default Privacy;
