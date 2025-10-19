// Copy of Code
import React from 'react';
import Header from '../components/Header';
import NoteEditor from '../components/NoteEditor';
import './Notes.css';

const Notes = ({ note, onSave, onCancel }) => {
  return (
    <div className="notes-page">
      <Header onNewNote={onCancel} onToggleAI={() => {}} />
      
      <div className="editor-container">
        <NoteEditor 
          note={note} 
          onSave={onSave} 
          onCancel={onCancel} 
        />
      </div>
    </div>
  );
};

export default Notes;
