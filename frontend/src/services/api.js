// Mock API service for demonstration
// In a real app, this would make actual HTTP requests

const API_BASE_URL = 'http://localhost:3001';

export const api = {
  get: async (endpoint) => {
    // Mock GET request
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  
  post: async (endpoint, data) => {
    // Mock POST request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  put: async (endpoint, data) => {
    // Mock PUT request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (endpoint) => {
    // Mock DELETE request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export default api;
