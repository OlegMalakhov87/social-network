import { getAccessTokenClaims } from '../../entities/auth/lib/accessToken';
import {
  logout,
  sessionLogoutObserved,
} from '../../entities/auth/model/authSlice';

/**
 * Создаёт обработчики сессии.
 *
 * @param {import('@reduxjs/toolkit').EnhancedStore} store - Хранилище Redux
 * @returns {{onSessionLogout: Function, onSessionChanged: Function}} Обработчики сессии.
 */
export const createAuthSessionHandlers = (store) => {
  /**
   * Завершает сессию при выходе из неё.
   *
   * @param {Object} payload - Данные события
   * @param {number} payload.userId - Идентификатор пользователя
   * @param {string} payload.sessionId - Идентификатор сессии
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
   * Сбрасывает авторизацию при смене сессии.
   *
   * @param {Object} payload - Данные события
   * @param {number} payload.userId - Идентификатор пользователя
   * @param {string} payload.sessionId - Идентификатор сессии
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
