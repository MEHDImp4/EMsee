
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Info, Users, Target } from 'lucide-react';

import './css/About.css';

const About = () => {
    const { t } = useTranslation();

    const team = [
        "Diouri Mehdi",
        "Rkha Adam",
        "Belaoud Mehdi",
        "El Kharazi Ibtihal"
    ];

    return (
        <section className="about-section">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="about-container-wrapper"
                >
                    <div className="about-header">
                        <div className="about-icon-wrapper">
                            <Info size={32} />
                        </div>
                        <h1 className="about-title">{t('about_page.title')}</h1>
                        <p className="about-description">{t('about_page.description')}</p>
                    </div>

                    <div className="about-features-grid">
                        <div className="about-feature-card">
                            <div className="about-feature-header">
                                <Target size={28} style={{ color: 'var(--primary)' }} />
                                <h3 className="about-feature-title">{t('about_page.mission_title')}</h3>
                            </div>
                            <p className="about-feature-text">{t('about_page.mission_desc')}</p>
                        </div>

                        <div className="about-feature-card">
                            <div className="about-feature-header" style={{ marginBottom: '1.5rem' }}>
                                <Users size={28} style={{ color: 'var(--primary)' }} />
                                <h3 className="about-feature-title">{t('about_page.team_title')}</h3>
                            </div>
                            <p className="team-description">{t('about_page.team_desc')}</p>
                            <div className="team-container">
                                {team.map((member, index) => (
                                    <div key={index} className="team-member-card">
                                        {member}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
