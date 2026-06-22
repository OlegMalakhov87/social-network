import axios from 'axios';

export const apiAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});
// Интерсептор запросов – добавляет токен
export function setupAxiosInterceptors(store) {
  apiAxios.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}
