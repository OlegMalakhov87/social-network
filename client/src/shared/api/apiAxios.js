import axios from 'axios';
import { API_URL } from '../config';
import { dispatchAuthLogout } from './authSession';

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
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  responseInterceptorId = apiAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      if (status === 401) {
        const url = error.config?.url || '';
        const isAuthRequest =
          url.includes('/auth/login') || url.includes('/auth/register');
        if (!isAuthRequest) {
          dispatchAuthLogout(store);
        }
      }
      return Promise.reject(error);
    }
  );
};
