import { createSlice } from '@reduxjs/toolkit';
import { apiErrorMessageFromPayload } from '../../../shared/lib';
import {
  changePassword,
  checkAuth,
  deleteUser,
  login,
  logoutSession,
  register,
  updateUser,
} from './authThunks';

/** Начальное состояние авторизации.*/
const initialState = {
  user: null, // пользователь
  token: null, // токен авторизации
  isCheckingAuth: true, // проверка авторизации при загрузке страницы
  isAuthenticated: false, // авторизован или нет
  status: 'idle', // состояние авторизации
  error: null, // ошибка авторизации
  authCheckRequestId: null, // идентификатор запроса проверки авторизации
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Обновление access token без изменения данных пользователя. */
    setAccessToken(state, action) {
      state.token = action.payload;
    },

    /** Выход пользователя.*/
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      state.authCheckRequestId = null;
      state.isCheckingAuth = false;
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
        state.authCheckRequestId = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = apiErrorMessageFromPayload(
          action.payload,
          'Ошибка авторизации'
        );
      })

      /** Регистрация пользователя.*/
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.authCheckRequestId = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = apiErrorMessageFromPayload(
          action.payload,
          'Ошибка регистрации'
        );
      })

      /** Проверка авторизации пользователя.*/
      .addCase(checkAuth.pending, (state, action) => {
        state.status = 'loading';
        state.isCheckingAuth = true;
        state.authCheckRequestId = action.meta.requestId;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (state.authCheckRequestId !== action.meta.requestId) {
          return;
        }

        state.authCheckRequestId = null;
        state.isCheckingAuth = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        if (state.authCheckRequestId !== action.meta.requestId) {
          return;
        }

        state.authCheckRequestId = null;
        state.isCheckingAuth = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.status = 'failed';
        state.error = apiErrorMessageFromPayload(
          action.payload,
          'Сессия истекла'
        );
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
        state.error = apiErrorMessageFromPayload(
          action.payload,
          'Ошибка обновления профиля'
        );
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
        state.authCheckRequestId = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = apiErrorMessageFromPayload(
          action.payload,
          'Ошибка удаления профиля'
        );
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
        state.error = apiErrorMessageFromPayload(
          action.payload,
          'Ошибка обновления пароля'
        );
      })

      /** Завершение текущей серверной сессии.*/
      .addCase(logoutSession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.authCheckRequestId = null;
        state.isCheckingAuth = false;
      })
      .addCase(logoutSession.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
        state.status = 'idle';
        state.error = null;
        state.authCheckRequestId = null;
      })
      .addCase(logoutSession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = apiErrorMessageFromPayload(
          action.payload,
          'Не удалось завершить сессию'
        );
      });
  },
});

export const { clearError, logout, setAccessToken } = authSlice.actions;

export default authSlice.reducer;
