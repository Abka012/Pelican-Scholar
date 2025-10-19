// Copy of Code
import React from 'react';

const NoteItem = ({ note, onDelete, onEdit }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
      <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{note.content}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {new Date(note.createdAt).toLocaleDateString()}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(note)}
            className="text-blue-500 hover:text-blue-700 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="text-red-500 hover:text-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteItem;
