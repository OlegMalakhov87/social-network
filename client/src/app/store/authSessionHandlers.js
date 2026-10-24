import { getAccessTokenClaims } from '../../entities/auth/lib/accessToken';
import {
  logout,
  sessionLogoutObserved,
} from '../../entities/auth/model/authSlice';

/**
 * Создаёт обработчики сессии.
 * @param {import('@reduxjs/toolkit').EnhancedStore} store
 * @returns {Object}
 */
export const createAuthSessionHandlers = (store) => {
  /**
   * Обработчик события logout.
   * @param {Object} payload
   * @param {number} payload.userId
   * @param {string} payload.sessionId
   * @returns {void}
   */
  const onSessionLogout = ({ userId, sessionId }) => {
    const auth = store.getState().auth;
    const claims = getAccessTokenClaims(auth.token);

    if (claims?.id === userId && claims?.sid === sessionId) {
      store.dispatch(logout());
      return;
    }

    if (!claims && auth.authCheckRequestId !== null) {
      store.dispatch(sessionLogoutObserved({ userId, sessionId }));
    }
  };

  /**
   * Обработчик события sessionChanged.
   * @param {Object} payload
   * @param {number} payload.userId
   * @param {string} payload.sessionId
   * @returns {void}
   */
  const onSessionChanged = ({ userId, sessionId }) => {
    const auth = store.getState().auth;
    const claims = getAccessTokenClaims(auth.token);

    if (claims?.id === userId && claims?.sid === sessionId) {
      return;
    }

    const shouldResetAuth =
      auth.isAuthenticated ||
      auth.authCheckRequestId !== null ||
      auth.authMutationRequestId !== null;

    if (shouldResetAuth) {
      store.dispatch(logout());
    }
  };

  return {
    onSessionLogout,
    onSessionChanged,
  };
};
