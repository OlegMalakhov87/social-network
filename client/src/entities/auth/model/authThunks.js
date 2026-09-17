import { createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentUser, loginUser, registerUser } from '..';
import { parseApiError } from '../../../shared/lib';
import {
  changePasswordApi,
  deleteCurrentUser,
  updateCurrentUser,
  uploadAvatarApi,
} from '../../user';
import { getToken } from '../lib/authStorage';

/** Авторизация пользователя. */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const data = await loginUser(credentials);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(parseApiError(error));
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
      return thunkAPI.rejectWithValue(parseApiError(error));
    }
  }
);

/** Проверка авторизации при запуске приложения. */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, thunkAPI) => {
    const token = getToken();
    if (!token) {
      return { skipped: true };
    }
    try {
      const data = await getCurrentUser();
      return data;
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

/** Загрузка аватара пользователя */
export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file, thunkAPI) => {
    try {
      const data = await uploadAvatarApi(file);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(parseApiError(error));
    }
  }
);
