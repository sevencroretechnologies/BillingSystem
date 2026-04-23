import axios from 'axios';

// Base URL for the Laravel API. Override via REACT_APP_API_URL in a `.env`
// file inside the `frontend` directory
// (e.g. REACT_APP_API_URL=http://localhost:8000).
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${baseURL.replace(/\/$/, '')}/api`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('billing_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Expose the raw backend base URL for things that aren't JSON (e.g. PDFs).
export const backendUrl = baseURL.replace(/\/$/, '');

export default api;
