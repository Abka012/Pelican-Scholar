// API service for connecting to Python backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://pelican-scholar.vercel.app/api'  // Replace with your actual production URL
  : 'http://localhost:8000/api';                // Local development

// Mock notes service for demonstration (keep this for local development)
// In a real app, this would use the API service

let notes = [
  {
    id: 1,
    title: 'Welcome to AI Notes',
    content: 'This is your first note. You can edit or delete it anytime.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Getting Started',
    content: 'Create new notes using the "New Note" button. Use the AI assistant to help organize your thoughts.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

let nextId = 3;

// API-based functions
export const getNotes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notes:', error);
    // Return mock data for development
    return new Promise((resolve) => {
      setTimeout(() => resolve(notes), 500);
    });
  }
};

export const createNote = async (noteData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const newNote = await response.json();
    return newNote;
  } catch (error) {
    console.error('Error creating note:', error);
    // Fallback to mock data
    const newNote = {
      id: nextId++,
      ...noteData,
      createdAt: new Date().toISOString(),
    };
    
    notes = [newNote, ...notes];
    return new Promise((resolve) => {
      setTimeout(() => resolve(newNote), 500);
    });
  }
};

export const updateNote = async (noteData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${noteData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const updatedNote = await response.json();
    return updatedNote;
  } catch (error) {
    console.error('Error updating note:', error);
    // Fallback to mock data
    const updatedNote = {
      ...noteData,
      updatedAt: new Date().toISOString(),
    };
    
    notes = notes.map(note => 
      note.id === noteData.id ? updatedNote : note
    );
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(updatedNote), 500);
    });
  }
};

export const deleteNote = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting note:', error);
    // Fallback to mock data
    notes = notes.filter(note => note.id !== id);
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  }
};

// New function for file summarization
export const summarizeFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error summarizing file:', error);
    throw error;
  }
};

// Keep the original mock functions for backward compatibility
export const saveNote = async (noteData) => {
  return createNote(noteData);
};
