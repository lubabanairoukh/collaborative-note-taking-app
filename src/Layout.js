// src/Layout.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <div className="layout">
      <header className="header" role="banner">
        <h1>Collaborative Note-Taking App</h1>
        <button className="nav-toggle" aria-label="Toggle navigation" onClick={toggleNav}>
          &#9776;
        </button>
        <nav className={`nav ${isNavOpen ? 'open' : ''}`} role="navigation">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main className="main-content" role="main">
        {children}
      </main>
      <footer className="footer" role="contentinfo">
        <p>&copy; 2024 Collaborative Note-Taking App</p>
      </footer>
    </div>
  );
}

export default Layout;
