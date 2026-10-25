import { configureStore } from '@reduxjs/toolkit';

import {
  loginUser,
  logoutUser,
  refreshAuth,
  registerUser,
} from '../../entities/auth/api/authApi';
import { getAccessTokenClaims } from '../../entities/auth/lib/accessToken';
import { createAuthRefreshCoordinator } from '../../entities/auth/lib/authRefreshCoordinator';
import authReducer, {
  logout,
  setAccessToken,
} from '../../entities/auth/model/authSlice';
import { setupAxiosInterceptors } from '../../shared/api/apiAxios';
import audioPlayerReducer from '../../widgets/audio-player/model/audioPlayerSlice';
import { createAuthSessionHandlers } from './authSessionHandlers';

// Хранит зависимости асинхронных операций Redux.
const authDependencies = {
  coordinator: null,
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    audioPlayer: audioPlayerReducer,
  },

  /**
   * Подключает зависимости к асинхронным операциям.
   *
   * @param {Function} getDefaultMiddleware - Возвращает стандартные промежуточные обработчики
   * @returns {Array} Промежуточные обработчики.
   */
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: authDependencies,
      },
    }),
});

const { onSessionLogout, onSessionChanged } = createAuthSessionHandlers(store);

// Создаёт координатор после хранилища Redux.
authDependencies.coordinator = createAuthRefreshCoordinator({
  getToken: () => store.getState().auth.token,
  refreshAuth,
  logoutUser,
  loginUser,
  registerUser,
  onSessionLogout,
  onSessionChanged,
});

setupAxiosInterceptors(store, {
  refreshSession: authDependencies.coordinator.refreshSession,
  notifySessionRevoked: authDependencies.coordinator.notifySessionRevoked,
  setAccessToken,
  getAccessTokenClaims,
  logout,
});
