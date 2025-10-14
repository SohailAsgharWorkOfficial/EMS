import axios from 'axios';

export const apiService = axios.create({
  baseURL: import.meta.env.VITE_EMPLOYEE_API,
  headers: {
    'Content-Type': 'application/json',
  },
});
