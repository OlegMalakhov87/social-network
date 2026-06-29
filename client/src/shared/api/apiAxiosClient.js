import axios from 'axios';
import { API_URL } from '../config';

let requestInterceptor = null;
let responseInterceptor = null;

export const apiAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Настраивает Axios interceptors.
 *
 * Добавляет JWT токен в каждый запрос
 * и обрабатывает глобальные ошибки ответов.
 *
 * @param {import('@reduxjs/toolkit').EnhancedStore} store
 */
export function setupAxiosInterceptors(store) {
  requestInterceptor = apiAxios.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (requestInterceptor !== null) {
        apiAxios.interceptors.request.eject(requestInterceptor);
      }
      return config;
    },

    (error) => Promise.reject(error)
  );

  responseInterceptor = apiAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn('Пользователь не авторизован');
      }
      if (responseInterceptor !== null) {
        apiAxios.interceptors.response.eject(responseInterceptor);
      }

      return Promise.reject(error);
    }
  );
}
