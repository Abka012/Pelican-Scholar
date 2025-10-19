import React, { useState } from 'react';
import './AIAssistant.css';

const AIAssistant = ({ onGenerateNote, onSuggestTitle }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      await onGenerateNote(prompt);
      setPrompt('');
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = async (suggestion) => {
    setIsLoading(true);
    try {
      await onSuggestTitle(suggestion);
    } catch (error) {
      console.error('Suggestion failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a poem about technology",
    "How to learn React in 30 days",
    "Benefits of meditation"
  ];

  return (
    <div className="ai-assistant">
      <h2>AI Assistant</h2>
      <form onSubmit={handleSubmit} className="ai-form">
        <input
          type="text"
          placeholder="Ask me anything about your notes..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="ai-input"
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Generate'}
        </button>
      </form>
      
      <div className="suggestions">
        <p>Try these suggestions:</p>
        <div className="suggestion-list">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestion(suggestion)}
              className="suggestion-btn"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
