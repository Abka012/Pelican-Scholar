import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Notes from './pages/Notes';
import { getNotes, createNote, updateNote, deleteNote, summarizeFile } from './services/notes';
import './App.css';

function App() {
  // ---------- State ----------
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryLength, setSummaryLength] = useState('medium');
  const [editingNote, setEditingNote] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [showAI, setShowAI] = useState(false);

  // ---------- Load notes ----------
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
  try {
    const data = await getNotes();
    // Ensure data is an array
    if (Array.isArray(data)) {
      setNotes(data);
    } else {
      console.error('API returned non-array notes:', data);
      setNotes([]);
    }
    setLoading(false);
  } catch (err) {
    console.error('Failed to load notes:', err);
    setError(err.message);
    setNotes([]); // fallback to empty array
    setLoading(false);
  }
};

  // ---------- File Upload ----------
  const handleFileUpload = async (file, summaryLength = 'medium') => {
    if (!file) return;

    try {
      const result = await summarizeFile(file, summaryLength); // ← sends file + summaryLength
      const newNote = {
        title: `Summary: ${result.filename}`,
        content: result.final_summary,
        createdAt: new Date().toISOString(),
      };
      const createdNote = await createNote(newNote);
      setNotes(prev => [createdNote, ...prev]);
    } catch (error) {
      console.error('Error summarizing file:', error);
      alert('Error summarizing file: ' + (error.message || 'Unknown error'));
    }
  };

  // ---------- Note management ----------
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

      await fetchNotes(); // was loadNotes()
      setCurrentPage('home');
      setSelectedNote(savedNote);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      await fetchNotes(); // was loadNotes()
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

  // ---------- AI & Title features ----------
  const handleGenerateNote = async (prompt) => {
    console.log('Generating note with prompt:', prompt);
    const mockResponse = `This is a generated note based on your prompt: "${prompt}". This demonstrates how the AI assistant would work with real AI services.`;

    const newNote = {
      title: `AI Generated: ${prompt.substring(0, 20)}...`,
      content: mockResponse,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createNote(newNote);
    await fetchNotes(); // was loadNotes()
  };

  const handleSuggestTitle = async (suggestion) => {
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

  // ---------- Conditional render ----------
  if (loading) {
    return <div className="App">Loading your notes...</div>;
  }

  if (error) {
    return (
      <div className="App">
        <p style={{ color: 'red' }}>Failed to load notes: {error}</p>
        <button onClick={fetchNotes}>Retry</button>
      </div>
    );
  }

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
        onFileUpload={handleFileUpload}       
        summaryLength={summaryLength}         
        setSummaryLength={setSummaryLength}
      />
    </div>
  );
}

export default App;
