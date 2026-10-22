import axios from 'axios';
import { API_URL } from '../config';

/**
 * Axios-клиент для операций с refresh-сессией.
 *
 * Не использует interceptors автоматического обновления токенов.
 */
export const authAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
