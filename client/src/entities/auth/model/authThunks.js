import { createAsyncThunk } from '@reduxjs/toolkit';
import { parseAuthApiError } from '..';
import {
  changePasswordApi,
  deleteCurrentUser,
  getCurrentUser,
  loginUser,
  registerUser,
  updateCurrentUser,
  uploadAvatarApi,
} from '../api/authApi';
import { getToken } from '../lib/authStorage';

/** Авторизация пользователя. */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const data = await loginUser(credentials);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(parseAuthApiError(error));
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
      return thunkAPI.rejectWithValue(parseAuthApiError(error));
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
      return { skipped: true, user: null, token: null };
    }
    try {
      const data = await getCurrentUser();
      return { user: data.user, token };
    } catch (error) {
      return thunkAPI.rejectWithValue(parseAuthApiError(error));
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

/** Загрузка аватара пользователя */
export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file, thunkAPI) => {
    try {
      const data = await uploadAvatarApi(file);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || 'Ошибка загрузки фото'
      );
    }
  }
);
