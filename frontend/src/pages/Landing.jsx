import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';

const Landing = ({ theme }) => {
    return (
        <>
            <Hero theme={theme} />
            <Features />
        </>
    );
};

export default Landing;
