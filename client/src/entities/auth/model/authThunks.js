import { createAsyncThunk } from '@reduxjs/toolkit';
import { parseApiError } from '../../../shared/lib';
import {
  changePasswordApi,
  deleteCurrentUser,
  updateCurrentUser,
} from '../../user';
import { getCurrentUser } from '../api/authApi';

/** Авторизация пользователя. */
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

/** Регистрация пользователя. */
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

/** Восстановление авторизации при запуске приложения. */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, thunkAPI) => {
    try {
      // Получаем новый access token через HttpOnly cookie.
      const { coordinator } = thunkAPI.extra;

      const { token } = await coordinator.refreshSession();

      if (typeof token !== 'string' || !token) {
        throw new Error('Сервер не вернул access token');
      }

      // Получаем пользователя с новым access token.
      const { user } = await getCurrentUser(token);

      return { user, token };
    } catch (error) {
      return thunkAPI.rejectWithValue(parseApiError(error));
    }
  }
);

/** Обновление профиля пользователя */
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

/** Удаление пользователя */
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

/** Обновление пароля текущего пользователя */
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
 * Завершение текущей серверной сессии.
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
