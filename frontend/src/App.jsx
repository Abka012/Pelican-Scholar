import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Notes from './pages/Notes';
import { getNotes, createNote, updateNote, deleteNote } from './services/notes';
import './App.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const loadedNotes = await getNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setCurrentPage('notes');
  };

  const handleSaveNote = async (noteData) => {
    try {
      let savedNote;
      if (editingNote) {
        savedNote = await updateNote(editingNote.id, noteData);
      } else {
        savedNote = await createNote(noteData);
      }
      
      await loadNotes();
      setCurrentPage('home');
      setSelectedNote(savedNote);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      await loadNotes();
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
  };

  const handleGenerateNote = async (prompt) => {
    // This would integrate with an actual AI service
    console.log('Generating note with prompt:', prompt);
    // Simulate API call
    const mockResponse = `This is a generated note based on your prompt: "${prompt}". This 
demonstrates how the AI assistant would work with real AI services.`;
    const newNote = {
      title: `AI Generated: ${prompt.substring(0, 20)}...`,
      content: mockResponse,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await createNote(newNote);
    await loadNotes();
  };

  const handleSuggestTitle = async (suggestion) => {
    // This would generate a title suggestion
    console.log('Suggesting title for:', suggestion);
    // Simulate title generation
    const mockTitle = `Thoughts on ${suggestion.substring(0, 15)}...`;
    setEditingNote({ title: mockTitle });
  };

  const handleCancel = () => {
    setCurrentPage('home');
    setSelectedNote(null);
    setEditingNote(null);
  };

  const toggleAI = () => {
    setShowAI(!showAI);
  };

  if (currentPage === 'notes') {
    return (
      <Notes 
        note={editingNote} 
        onSave={handleSaveNote} 
        onCancel={handleCancel} 
      />
    );
  }

  return (
    <div className="App">
      <Home 
        notes={notes}
        selectedNote={selectedNote}
        onSelectNote={handleSelectNote}
        onDeleteNote={handleDeleteNote}
        onNewNote={handleCreateNote}
        onToggleAI={toggleAI}
        onGenerateNote={handleGenerateNote}
        onSuggestTitle={handleSuggestTitle}
      />
    </div>
  );
};

export default App;
