import { createSlice } from '@reduxjs/toolkit';
import {
  login,
  register,
  fetchCurrentUser,
  checkAuth,
  updateUser,
  deleteUser,
  changePassword,
} from './authThunks';
import { saveToken, getToken, removeToken } from './authStorage';

/** Начальное состояние авторизации.*/
const initialState = {
  user: null,
  token: getToken(),
  isAuthenticated: !!getToken(),
  status: 'idle', // idle | loading | succeeded | failed
  error: null, // Текст ошибки, полученной от сервера.
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Выход пользователя.*/
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      removeToken();
    },

    /**Очистить ошибку.*/
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /** Авторизация пользователя.*/
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        saveToken(action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload || action.error.message || 'Ошибка авторизации';
      })

      /** Регистрация пользователя.*/
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        saveToken(action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload || action.error.message || 'Ошибка регистрации';
      })

      /** Получение пользователя.*/
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error =
          action.payload ||
          action.error.message ||
          'Не удалось получить пользователя';
        removeToken();
      })

      /** Проверка авторизации пользователя.*/
      .addCase(checkAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error =
          action.payload ||
          action.error.message ||
          'Пользователь не авторизирован';
        removeToken();
      })

      /** Обновление профиля пользователя.*/
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload || action.error.message || 'Ошибка обновления профиля';
      })

      /** Удаление профиля пользователя.*/
      .addCase(deleteUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload || action.error.message || 'Ошибка удаления профиля';
      })

      /** Обновление пароля пользователя.*/
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload || action.error.message || 'Ошибка обновления пароля';
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
