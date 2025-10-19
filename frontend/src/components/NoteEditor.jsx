import React, { useState, useEffect } from 'react';
import './NoteEditor.css';

const NoteEditor = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSave({ title: title.trim(), content: content.trim() });
    }
  };

  return (
    <div className="note-editor">
      <form onSubmit={handleSubmit} className="editor-form">
        <input
          type="text"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
          autoFocus
        />
        <textarea
          placeholder="Start writing your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="content-textarea"
        />
        <div className="editor-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Note
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteEditor;
