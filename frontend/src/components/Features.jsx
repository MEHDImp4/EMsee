import React from 'react';
import { motion } from 'framer-motion';
import { Image, MessageSquare, BarChart2, Code, Heart, Repeat, AtSign, Users, MessageCircle, Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import './css/Features.css';

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
        { icon: <Users size={32} />, title: t('features.communities_title'), desc: t('features.communities_desc') },
        { icon: <MessageCircle size={32} />, title: t('features.messaging_title'), desc: t('features.messaging_desc') },
        { icon: <Bookmark size={32} />, title: t('features.bookmarks_title'), desc: t('features.bookmarks_desc') },
    ];

    return (
        <section className="features-section">
            <div className="container">
                <div className="features-header">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="features-title"
                    >
                        {t('features.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="features-subtitle"
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
                            <div className="feature-icon-wrapper">
                                {feature.icon}
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-desc">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
