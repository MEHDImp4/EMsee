import React from 'react';
import { motion } from 'framer-motion';
import mockupFeed from '../assets/mockup_feed.png';
import mockupFeedDark from '../assets/mockup_feed_dark.png';

const Hero = ({ theme }) => {
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
                        Le réseau social <span style={{ color: 'var(--primary)' }}>étudiant</span> qui vous connecte.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '600px', marginInline: 'auto' }}
                    >
                        Partagez vos idées, collaborez sur des projets et restez informés de la vie du campus. Une communauté bienveillante vous attend.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>Rejoindre EMSI</button>
                        <button className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>En savoir plus</button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="animate-float"
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}
                >
                    <div style={{
                        background: 'linear-gradient(135deg, #4ADE80 0%, #FB923C 100%)',
                        position: 'absolute',
                        inset: '-20px',
                        borderRadius: '2rem',
                        opacity: 0.2,
                        filter: 'blur(40px)',
                        zIndex: -1
                    }}></div>
                    <img
                        src={theme === 'dark' ? mockupFeedDark : mockupFeed}
                        alt="Interface de l'application EMSI"
                        style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: '1rem',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
