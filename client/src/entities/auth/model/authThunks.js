import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  changePasswordApi,
  deleteCurrentUser,
  getCurrentUser,
  getToken,
  loginUser,
  registerUser,
  updateCurrentUser,
} from '..';

/** Авторизация пользователя. */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const data = await loginUser(credentials);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || 'Ошибка авторизации'
      );
    }
  }
);

/** Регистрация пользователя. */
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const data = await registerUser(userData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || 'Ошибка регистрации'
      );
    }
  }
);

/** Получение текущего пользователя. */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, thunkAPI) => {
    try {
      const data = await getCurrentUser();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          'Не удалось получить пользователя'
      );
    }
  }
);

/** Проверка авторизации при запуске приложения. */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, thunkAPI) => {
    const token = getToken();
    if (!token) {
      return thunkAPI.rejectWithValue('Токен отсутствует');
    }
    try {
      const data = await getCurrentUser();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          'Сессия истекла, превышен лимит ожидания'
      );
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
      return thunkAPI.rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          'Не удалось обновить профиль'
      );
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
      return thunkAPI.rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          'Не удалось удалить пользователя'
      );
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
      return thunkAPI.rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          'Не удалось изменить пароль'
      );
    }
  }
);
