import React from 'react';
import './NoteList.css';

const NoteList = ({ notes, onSelectNote, onDeleteNote, selectedNoteId }) => {
  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <p>No notes yet. Create your first note!</p>
      </div>
    );
  }

  return (
    <div className="note-list">
      {notes.map(note => (
        <div 
          key={note.id}
          className={`note-item ${selectedNoteId === note.id ? 'selected' : ''}`}
          onClick={() => onSelectNote(note)}
        >
          <div className="note-header">
            <h3 className="note-title">{note.title}</h3>
            <button 
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
              }}
            >
              ×
            </button>
          </div>
          <p className="note-preview">{note.content.substring(0, 100)}...</p>
          <p className="note-date">{new Date(note.updatedAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
