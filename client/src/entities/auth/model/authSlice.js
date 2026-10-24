import { createSlice } from '@reduxjs/toolkit';
import { apiErrorMessageFromPayload } from '../../../shared/lib';
import { getAccessTokenClaims } from '../lib/accessToken';
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
  authMutationRequestId: null, // идентификатор запроса мутации авторизации
  pendingSessionLogouts: [], // события logout, полученные во время checkAuth
  isLoggingOut: false, // флаг для определения, идет ли процесс выхода из сессии
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Обновление access token без изменения данных пользователя. */
    setAccessToken(state, action) {
      const { token, expectedToken } = action.payload ?? {};

      // Обновлять можно только существующую авторизацию.
      if (
        !state.isAuthenticated ||
        state.isLoggingOut ||
        state.authCheckRequestId !== null ||
        state.authMutationRequestId !== null ||
        typeof token !== 'string' ||
        typeof expectedToken !== 'string' ||
        state.token !== expectedToken
      ) {
        return;
      }

      const previousClaims = getAccessTokenClaims(expectedToken);
      const nextClaims = getAccessTokenClaims(token);

      if (
        !previousClaims ||
        !nextClaims ||
        previousClaims.id !== nextClaims.id ||
        previousClaims.sid !== nextClaims.sid ||
        state.user?.id !== nextClaims.id
      ) {
        return;
      }

      state.token = token;
    },

    /** Учитываем события только во время checkAuth. */
    sessionLogoutObserved(state, action) {
      if (state.authCheckRequestId === null) {
        return;
      }

      const { userId, sessionId } = action.payload;

      const alreadyRecorded = state.pendingSessionLogouts.some(
        (entry) => entry.userId === userId && entry.sessionId === sessionId
      );

      if (!alreadyRecorded) {
        state.pendingSessionLogouts.push({
          userId,
          sessionId,
        });
      }
    },

    /** Выход пользователя.*/
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      state.authCheckRequestId = null;
      state.authMutationRequestId = null;
      state.isCheckingAuth = false;
      state.pendingSessionLogouts = [];
      state.isLoggingOut = false;
    },

    /**Очистить ошибку.*/
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /** Авторизация пользователя.*/
      .addCase(login.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.authCheckRequestId = null;
        state.authMutationRequestId = action.meta.requestId;
        state.pendingSessionLogouts = [];
      })
      .addCase(login.fulfilled, (state, action) => {
        if (state.authMutationRequestId !== action.meta.requestId) {
          return;
        }

        state.authMutationRequestId = null;
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        if (state.authMutationRequestId !== action.meta.requestId) {
          return;
        }

        state.authMutationRequestId = null;
        state.status = 'failed';
        state.error = apiErrorMessageFromPayload(
          action.payload,
          'Ошибка авторизации'
        );
      })

      /** Регистрация пользователя.*/
      .addCase(register.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.authCheckRequestId = null;
        state.authMutationRequestId = action.meta.requestId;
        state.pendingSessionLogouts = [];
      })
      .addCase(register.fulfilled, (state, action) => {
        if (state.authMutationRequestId !== action.meta.requestId) {
          return;
        }

        state.authMutationRequestId = null;
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        if (state.authMutationRequestId !== action.meta.requestId) {
          return;
        }

        state.authMutationRequestId = null;
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
        state.pendingSessionLogouts = [];
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (state.authCheckRequestId !== action.meta.requestId) {
          return;
        }

        const pendingLogouts = state.pendingSessionLogouts;

        state.authCheckRequestId = null;
        state.pendingSessionLogouts = [];

        const claims = getAccessTokenClaims(action.payload.token);

        const sessionWasLoggedOut = pendingLogouts.some(
          ({ userId, sessionId }) =>
            claims?.id === userId && claims?.sid === sessionId
        );

        if (sessionWasLoggedOut) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isCheckingAuth = false;
          state.status = 'idle';
          state.error = null;
          return;
        }

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
        state.pendingSessionLogouts = [];
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
        state.authMutationRequestId = null;
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
        state.authMutationRequestId = null;
        state.pendingSessionLogouts = [];
        state.isLoggingOut = true;
      })
      .addCase(logoutSession.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
        state.status = 'idle';
        state.error = null;
        state.authCheckRequestId = null;
        state.authMutationRequestId = null;
        state.isLoggingOut = false;
      })
      .addCase(logoutSession.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoggingOut = false;
        state.error = apiErrorMessageFromPayload(
          action.payload,
          'Не удалось завершить сессию'
        );
      });
  },
});

export const { clearError, logout, setAccessToken, sessionLogoutObserved } =
  authSlice.actions;

export default authSlice.reducer;
