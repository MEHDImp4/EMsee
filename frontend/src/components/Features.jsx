import React from 'react';
import { motion } from 'framer-motion';
import { Image, MessageSquare, BarChart2, Code, Heart, Repeat, AtSign } from 'lucide-react';

const features = [
    { icon: <MessageSquare size={32} />, title: "Discussions", desc: "Partagez du texte et échangez avec la communauté." },
    { icon: <Image size={32} />, title: "Médias", desc: "Publiez vos meilleures photos et créations." },
    { icon: <BarChart2 size={32} />, title: "Sondages", desc: "Demandez l'avis des autres étudiants facilement." },
    { icon: <Code size={32} />, title: "Code Snippets", desc: "Partagez et débuggez du code ensemble." },
    { icon: <Heart size={32} />, title: "Likes", desc: "Montrez votre appréciation pour les posts." },
    { icon: <Repeat size={32} />, title: "Retweets", desc: "Relayez les informations importantes." },
    { icon: <AtSign size={32} />, title: "Mentions", desc: "Taguez vos amis pour les notifier." },
];

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
                        Tout ce dont vous avez besoin
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}
                    >
                        Une suite complète d'outils pour interagir.
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
