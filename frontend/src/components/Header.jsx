import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import logo from '../assets/logo.svg';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header style={{ padding: '1.5rem 0', position: 'sticky', top: 0, background: 'var(--header-bg)', backdropFilter: 'blur(10px)', zIndex: 50, transition: 'background-color 0.3s ease' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <img src={logo} alt="EMsee Logo" style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>EMsee</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'none', gap: '1rem', alignItems: 'center' }} className="desktop-nav">
          <style>{`
            @media (min-width: 768px) {
              .desktop-nav { display: flex !important; }
              .mobile-actions { display: none !important; }
            }
          `}</style>
          <Link to="/login" className="btn btn-secondary">Se connecter</Link>
          <Link to="/register" className="btn btn-primary">Créer un compte</Link>
        </nav>

        {/* Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="mobile-actions">
          <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', padding: '0.5rem', color: 'var(--text-main)' }}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--card-bg)',
          padding: '2rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }} onClick={() => setIsMenuOpen(false)}>Se connecter</Link>
          <Link to="/register" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={() => setIsMenuOpen(false)}>Créer un compte</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
