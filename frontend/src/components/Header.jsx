// src/components/Header.jsx
import React, { useState } from 'react';
import './Header.css';

const Header = ({ onNewNote, onToggleAI, onFileUpload }) => {
  const [summaryLength, setSummaryLength] = useState('medium');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileUpload) {
      onFileUpload(file, summaryLength);
      // Reset input so the same file can be re-uploaded
      e.target.value = '';
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">Pelican Scholar</h1>
        <div className="header-actions">
          {/* Summary Length Selector */}
          <select
            value={summaryLength}
            onChange={(e) => setSummaryLength(e.target.value)}
            className="summary-select"
            aria-label="Summary length"
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>

          {/* File Upload Input */}
          <label className="file-upload-label">
            <span className="btn btn-secondary">Upload</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }} // hide the default file input
              aria-label="Upload document for summarization"
            />
          </label>

          {/* AI Assistant Button */}
          <button className="btn btn-secondary" onClick={onToggleAI}>
            AI Assistant
          </button>

          {/* New Note Button */}
          <button className="btn btn-primary" onClick={onNewNote}>
            New Note
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
