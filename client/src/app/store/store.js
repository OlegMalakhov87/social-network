import { configureStore } from '@reduxjs/toolkit';

import { authReducer, getAccessTokenClaims, logout } from '../../entities/auth';
import {
  loginUser,
  logoutUser,
  refreshAuth,
  registerUser,
} from '../../entities/auth/api/authApi';
import { createAuthRefreshCoordinator } from '../../entities/auth/lib/authRefreshCoordinator';

import { setupAxiosInterceptors } from '../../shared/api';
import { audioPlayerReducer } from '../../widgets/audio-player';

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

/** Создаём координатор после создания Redux Store */
authDependencies.coordinator = createAuthRefreshCoordinator({
  getToken: () => store.getState().auth.token,
  refreshAuth,
  logoutUser,
  loginUser,
  registerUser,
  onSessionLogout: ({ userId, sessionId }) => {
    const auth = store.getState().auth;
    const claims = getAccessTokenClaims(auth.token);

    if (claims) {
      if (claims.id === userId && claims.sid === sessionId) {
        store.dispatch(logout());
      }

      return;
    }

    if (auth.authCheckRequestId !== null) {
      store.dispatch(logout());
    }
  },
  onSessionChanged: ({ userId, sessionId }) => {
    const auth = store.getState().auth;
    const claims = getAccessTokenClaims(auth.token);

    if (claims?.id === userId && claims?.sid === sessionId) {
      return;
    }

    if (auth.isAuthenticated) {
      store.dispatch(logout());
      return;
    }

    if (auth.authCheckRequestId !== null) {
      store.dispatch(logout());
    }
  },
});

/** Настраиваем interceptors для axios */
setupAxiosInterceptors(store);
