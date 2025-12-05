import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';

const Hero = ({ theme }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
        <section style={{ padding: '4rem 0', overflow: 'hidden' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '3rem' }}>
                <div style={{ maxWidth: '800px' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', marginBottom: '1.5rem', lineHeight: 1.1 }}
                    >
                        <Trans i18nKey="hero.title">
                            Le réseau social <span style={{ color: 'var(--primary)' }}>étudiant</span> qui vous connecte.
                        </Trans>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '600px', marginInline: 'auto' }}
                    >
                        {t('hero.subtitle')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>{t('hero.join')}</button>
                        <button className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>{t('hero.learn_more')}</button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
