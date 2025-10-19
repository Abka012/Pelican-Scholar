import React from 'react';
import './Header.css';

const Header = ({ onNewNote, onToggleAI }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">Pelican Scholar</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onToggleAI}>
            AI Assistant
          </button>
          <button className="btn btn-primary" onClick={onNewNote}>
            New Note
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
