import axios from 'axios';
import { API_URL } from '../config';

/** Axios клиент для взаимодействия с сервером. */
export const apiAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

let requestInterceptorId = null;
let responseInterceptorId = null;

/**
 * Настраивает Axios interceptors.
 * Добавляет JWT токен в каждый запрос и обрабатывает глобальные ошибки ответов.
 *
 * @param {import('@reduxjs/toolkit').EnhancedStore} store
 */
export const setupAxiosInterceptors = (store) => {
  // Удаляем предыдущие интерцепторы перед регистрацией новых
  if (requestInterceptorId !== null) {
    apiAxios.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId !== null) {
    apiAxios.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = apiAxios.interceptors.request.use(
    (config) => {
      const token = store.getState().auth?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  responseInterceptorId = apiAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn('Пользователь не авторизован');
      }
      return Promise.reject(error);
    }
  );
};
