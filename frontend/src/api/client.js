import axios from 'axios';

// Base URL for the Laravel API. Override via VITE_API_URL in a `.env` file
// inside the `frontend` directory (e.g. VITE_API_URL=http://localhost:8000).
const baseURL =
  (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${baseURL.replace(/\/$/, '')}/api`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Expose the raw backend base URL for things that aren't JSON (e.g. PDFs).
export const backendUrl = baseURL.replace(/\/$/, '');

export default api;
