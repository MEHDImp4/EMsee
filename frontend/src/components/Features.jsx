import React from 'react';
import { motion } from 'framer-motion';
import { Image, MessageSquare, BarChart2, Code, Heart, Repeat, AtSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const Features = () => {
    const { t } = useTranslation();

    const features = [
        { icon: <MessageSquare size={32} />, title: t('features.discussions_title'), desc: t('features.discussions_desc') },
        { icon: <Image size={32} />, title: t('features.medias_title'), desc: t('features.medias_desc') },
        { icon: <BarChart2 size={32} />, title: t('features.polls_title'), desc: t('features.polls_desc') },
        { icon: <Code size={32} />, title: t('features.code_title'), desc: t('features.code_desc') },
        { icon: <Heart size={32} />, title: t('features.likes_title'), desc: t('features.likes_desc') },
        { icon: <Repeat size={32} />, title: t('features.retweets_title'), desc: t('features.retweets_desc') },
        { icon: <AtSign size={32} />, title: t('features.mentions_title'), desc: t('features.mentions_desc') },
    ];

    return (
        <section style={{ padding: '6rem 0', background: 'var(--bg-soft)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}
                    >
                        {t('features.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}
                    >
                        {t('features.subtitle')}
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid-features"
                >
                    {features.map((feature, index) => (
                        <motion.div key={index} variants={item} className="feature-card">
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(74, 222, 128, 0.1)',
                                color: 'var(--primary)',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
