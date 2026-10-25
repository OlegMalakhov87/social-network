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

/** Хранит начальное состояние авторизации. */
const initialState = {
  user: null,
  token: null,
  isCheckingAuth: true, // Идёт проверка авторизации при загрузке страницы.
  isAuthenticated: false,
  status: 'idle',
  error: null,
  authCheckRequestId: null,
  authMutationRequestId: null,
  pendingSessionLogouts: [], // Хранит события выхода, полученные во время checkAuth.
  isLoggingOut: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Обновляет маркер доступа без изменения данных пользователя.
     *
     * @param {Object} state - Состояние авторизации
     * @param {Object} action - Действие Redux
     * @returns {void}
     */
    setAccessToken(state, action) {
      const { token, expectedToken } = action.payload ?? {};

      // Обновляет маркер доступа только у текущей авторизации.
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

    /**
     * Учитывает события выхода только во время checkAuth.
     *
     * @param {Object} state - Состояние авторизации
     * @param {Object} action - Действие Redux
     * @returns {void}
     */
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

    /**
     * Сбрасывает авторизацию пользователя.
     *
     * @param {Object} state - Состояние авторизации
     * @returns {void}
     */
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

    /**
     * Очищает ошибку авторизации.
     *
     * @param {Object} state - Состояние авторизации
     * @returns {void}
     */
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /** Обрабатывает авторизацию пользователя. */
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

      /** Обрабатывает регистрацию пользователя. */
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

      /** Обрабатывает проверку авторизации. */
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

      /** Обрабатывает обновление профиля. */
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

      /** Обрабатывает удаление профиля. */
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

      /** Обрабатывает обновление пароля. */
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

      /** Обрабатывает завершение сессии на сервере. */
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
