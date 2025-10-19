import React from 'react';
import Header from '../components/Header';
import NoteList from '../components/NoteList';
import AIAssistant from '../components/AIAssistant';
import './Home.css';

const Home = ({ 
  notes, 
  selectedNote, 
  onSelectNote, 
  onDeleteNote, 
  onNewNote, 
  onToggleAI,
  onGenerateNote,
  onSuggestTitle
}) => {
  return (
    <div className="home">
      <Header onNewNote={onNewNote} onToggleAI={onToggleAI} />
      
      <div className="main-content">
        <div className="sidebar">
          <AIAssistant 
            onGenerateNote={onGenerateNote} 
            onSuggestTitle={onSuggestTitle} 
          />
          <NoteList 
            notes={notes} 
            onSelectNote={onSelectNote} 
            onDeleteNote={onDeleteNote}
            selectedNoteId={selectedNote?.id}
          />
        </div>
        
        <div className="content">
          {selectedNote ? (
            <div className="note-view">
              <h2>{selectedNote.title}</h2>
              <p>{selectedNote.content}</p>
              <p className="note-meta">
                Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="empty-note">
              <h3>Select a note to view</h3>
              <p>Choose a note from the list or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
