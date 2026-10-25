import { createAsyncThunk } from '@reduxjs/toolkit';

import { parseApiError } from '../../../shared/lib';
import {
  changePasswordApi,
  deleteCurrentUser,
  updateCurrentUser,
} from '../../user';
import { getCurrentUser } from '../api/authApi';

/**
 * Авторизует пользователя.
 *
 * @param {Object} credentials - Почта и пароль
 * @returns {Promise<{ user: Object, token: string }>} Пользователь и маркер доступа
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const { coordinator } = thunkAPI.extra;

      return await coordinator.loginSession(credentials);
    } catch (error) {
      return thunkAPI.rejectWithValue(parseApiError(error));
    }
  }
);

/**
 * Регистрирует пользователя.
 *
 * @param {Object} formData - Данные нового пользователя
 * @returns {Promise<{ user: Object, token: string }>} Пользователь и маркер доступа
 */
export const register = createAsyncThunk(
  'auth/register',
  async (formData, thunkAPI) => {
    try {
      const { coordinator } = thunkAPI.extra;

      return await coordinator.registerSession(formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(parseApiError(error));
    }
  }
);

/**
 * Восстанавливает авторизацию при запуске приложения.
 *
 * @returns {Promise<{ user: Object, token: string }>} Пользователь и маркер доступа
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, thunkAPI) => {
    try {
      // Запрашивает новый маркер доступа через HTTP-only cookie.
      const { coordinator } = thunkAPI.extra;

      const { token } = await coordinator.refreshSession();

      if (typeof token !== 'string' || !token) {
        throw new Error('Сервер не вернул access token');
      }

      const { user } = await getCurrentUser(token);

      return { user, token };
    } catch (error) {
      return thunkAPI.rejectWithValue(parseApiError(error));
    }
  }
);

/**
 * Обновляет профиль пользователя.
 *
 * @param {Object} userData - Данные профиля
 * @returns {Promise<{ user: Object }>} Обновлённый пользователь
 */
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (userData, thunkAPI) => {
    try {
      const data = await updateCurrentUser(userData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(parseApiError(error));
    }
  }
);

/**
 * Удаляет пользователя.
 *
 * @returns {Promise<boolean>} Признак удаления
 */
export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async (_, thunkAPI) => {
    try {
      await deleteCurrentUser();
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(parseApiError(error));
    }
  }
);

/**
 * Обновляет пароль текущего пользователя.
 *
 * @param {Object} credentials - Текущий и новый пароль
 * @returns {Promise<Object>} Ответ сервера
 */
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (credentials, thunkAPI) => {
    try {
      const data = await changePasswordApi(credentials);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(parseApiError(error));
    }
  }
);

/**
 * Завершает текущую сессию на сервере.
 *
 * @returns {Promise<{ sessionChanged: boolean }>} Признак смены сессии
 */
export const logoutSession = createAsyncThunk(
  'auth/logoutSession',
  async (_, thunkAPI) => {
    try {
      const { coordinator } = thunkAPI.extra;

      await coordinator.endSession();

      return { sessionChanged: false };
    } catch (error) {
      if (
        error.response?.status === 409 &&
        error.response?.data?.code === 'SESSION_CHANGED'
      ) {
        return { sessionChanged: true };
      }
      return thunkAPI.rejectWithValue(parseApiError(error));
    }
  }
);
