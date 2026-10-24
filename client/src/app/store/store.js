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

/** Объект зависимостей для async thunks */
const authDependencies = {
  coordinator: null,
};

/** Создаём Redux Store */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    audioPlayer: audioPlayerReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: authDependencies,
      },
    }),
});

/** Создаём обработчики сессии */
const { onSessionLogout, onSessionChanged } = createAuthSessionHandlers(store);

/** Создаём координатор после создания Redux Store */
authDependencies.coordinator = createAuthRefreshCoordinator({
  getToken: () => store.getState().auth.token,
  refreshAuth,
  logoutUser,
  loginUser,
  registerUser,
  onSessionLogout,
  onSessionChanged,
});

/** Настраиваем interceptors для axios */
setupAxiosInterceptors(store, {
  refreshSession: authDependencies.coordinator.refreshSession,
  notifySessionRevoked: authDependencies.coordinator.notifySessionRevoked,
  setAccessToken,
  getAccessTokenClaims,
  logout,
});
