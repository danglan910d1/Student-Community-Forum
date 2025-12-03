// src/services/api.ts

import axios from 'axios';

export const api = axios.create({
  // Base URL sẽ là http://localhost:5000/api
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// ... (Interceptors)
