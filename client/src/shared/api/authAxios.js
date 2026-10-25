import axios from 'axios';

import { API_URL } from '../config';

/**
 * Выполняет запросы обновления сессии и не обновляет маркер доступа автоматически.
 */
export const authAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
