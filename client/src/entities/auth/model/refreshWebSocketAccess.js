import { logout, setAccessToken } from './authSlice';

/**
 * Обновляет маркер доступа после истечения авторизации WebSocket.
 *
 * @returns {Function} Обработчик обновления маркера доступа
 */
export const refreshWebSocketAccess =
  () => async (dispatch, getState, { coordinator }) => {
    const auth = getState().auth;

    if (
      !auth.isAuthenticated ||
      auth.isLoggingOut ||
      auth.authCheckRequestId !== null ||
      auth.authMutationRequestId !== null ||
      !auth.token
    ) {
      return;
    }

    const expectedToken = auth.token;

    try {
      const { token } = await coordinator.refreshSession();

      dispatch(
        setAccessToken({
          token,
          expectedToken,
        })
      );
    } catch (error) {
      const currentAuth = getState().auth;

      if (
        error.response?.status === 401 &&
        currentAuth.isAuthenticated &&
        !currentAuth.isLoggingOut &&
        currentAuth.token === expectedToken
      ) {
        coordinator.notifySessionRevoked(expectedToken);
        dispatch(logout());
      }

      throw error;
    }
  };

/**
 * Завершает авторизацию, если WebSocket отозвал ту же сессию.
 *
 * @param {string} expectedToken - Текущий маркер доступа
 * @returns {Function} Обработчик отзыва сессии
 */
export const handleWebSocketSessionRevoked =
  (expectedToken) => (dispatch, getState, { coordinator }) => {
    const auth = getState().auth;

    if (
      !auth.isAuthenticated ||
      auth.isLoggingOut ||
      auth.token !== expectedToken
    ) {
      return;
    }

    coordinator.notifySessionRevoked(expectedToken);
    dispatch(logout());
  };
