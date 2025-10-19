// Mock notes service for demonstration
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

export const getNotes = async () => {
  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => resolve(notes), 500);
  });
};

export const createNote = async (noteData) => {
  const newNote = {
    id: nextId++,
    ...noteData,
    createdAt: new Date().toISOString(),
  };
  
  notes = [newNote, ...notes];
  
  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => resolve(newNote), 500);
  });
};

export const saveNote = async (noteData) => {
  const newNote = {
    id: nextId++,
    ...noteData,
    createdAt: new Date().toISOString(),
  };
  
  notes = [newNote, ...notes];
  
  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => resolve(newNote), 500);
  });
};

export const updateNote = async (noteData) => {
  const updatedNote = {
    ...noteData,
    updatedAt: new Date().toISOString(),
  };
  
  notes = notes.map(note => 
    note.id === noteData.id ? updatedNote : note
  );
  
  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => resolve(updatedNote), 500);
  });
};

export const deleteNote = async (id) => {
  notes = notes.filter(note => note.id !== id);
  
  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 500);
  });
};
