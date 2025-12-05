import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';

import './css/Hero.css';

const Hero = ({ theme }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
        <section className="hero-section">
            <div className="container hero-container">
                <div className="hero-content-wrapper">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="hero-title"
                    >
                        <Trans i18nKey="hero.title">
                            Le réseau social <span className="hero-highlight">étudiant</span> qui vous connecte.
                        </Trans>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="hero-subtitle"
                    >
                        {t('hero.subtitle')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="hero-buttons"
                    >
                        <button onClick={() => navigate('/register')} className="btn btn-primary hero-btn">{t('hero.join')}</button>
                        <button onClick={() => navigate('/about')} className="btn btn-outline hero-btn">{t('hero.learn_more')}</button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
