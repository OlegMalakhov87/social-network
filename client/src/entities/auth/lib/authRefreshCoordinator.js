import {
  createAuthRefreshChannel,
  withAuthRefreshLock,
} from '../../../shared/lib';
import { getAccessTokenClaims, isAccessTokenUsable } from './accessToken';
import { AUTH_MESSAGE_TYPES } from './authRefreshMessages';

/**
 * Создаёт координатор обмена сообщениями авторизации.
 *
 * @param {Object} options
 * @param {() => string | null} options.getToken - функция для получения токена
 * @param {() => Promise<void>} options.refreshAuth - функция для обновления токена
 * @param {() => Promise<void>} options.logoutUser - функция для завершения сессии
 * @param {() => Promise<void>} options.loginUser - функция для авторизации пользователя
 * @param {() => Promise<void>} options.registerUser - функция для регистрации пользователя
 * @param {() => Promise<void>} options.onSessionLogout - функция для выполнения после завершения сессии
 * @param {() => Promise<void>} options.onSessionChanged - функция для выполнения после изменения сессии
 * @returns {Object}
 */
export const createAuthRefreshCoordinator = ({
  getToken,
  refreshAuth,
  logoutUser,
  loginUser,
  registerUser,
  onSessionLogout,
  onSessionChanged,
}) => {
  const channel = createAuthRefreshChannel();
  const tabId = crypto.randomUUID();

  let disposed = false;

  /**
   * Обработчик входящих сообщений
   */
  const handleMessage = (message) => {
    if (
      disposed ||
      !message ||
      typeof message !== 'object' ||
      message.senderId === tabId
    ) {
      return;
    }

    if (message.type === AUTH_MESSAGE_TYPES.SESSION_LOGOUT) {
      const { userId, sessionId } = message;

      if (
        !Number.isSafeInteger(userId) ||
        userId <= 0 ||
        typeof sessionId !== 'string' ||
        !sessionId
      ) {
        return;
      }

      onSessionLogout?.({ userId, sessionId });

      return;
    }

    if (message.type === AUTH_MESSAGE_TYPES.TOKEN_REQUEST) {
      const { requestId, userId, sessionId } = message;

      if (
        typeof requestId !== 'string' ||
        !requestId ||
        !Number.isSafeInteger(userId) ||
        userId <= 0 ||
        typeof sessionId !== 'string' ||
        !sessionId
      ) {
        return;
      }

      if (message.type === AUTH_MESSAGE_TYPES.SESSION_CHANGED) {
        const { userId, sessionId } = message;

        if (
          !Number.isSafeInteger(userId) ||
          userId <= 0 ||
          typeof sessionId !== 'string' ||
          !sessionId
        ) {
          return;
        }

        onSessionChanged?.({ userId, sessionId });

        return;
      }

      const token = getToken();

      if (!isAccessTokenUsable(token)) {
        return;
      }

      const claims = getAccessTokenClaims(token);

      if (claims.id !== userId || claims.sid !== sessionId) {
        return;
      }

      channel.publish({
        type: AUTH_MESSAGE_TYPES.TOKEN_RESPONSE,
        senderId: tabId,
        requestId,
        token,
      });
    }
  };

  const unsubscribe = channel.subscribe(handleMessage);

  /**
   * Освобождает ресурсы координатора.
   */
  const dispose = () => {
    if (disposed) return;

    disposed = true;
    unsubscribe();
    channel.close();
  };

  /** Выполняет операцию под общей блокировкой авторизации
   *
   * @param {() => Promise<any>} operation
   * @returns {Promise<any>}
   */
  const runLocked = (operation) => {
    if (disposed) {
      return Promise.reject(
        new Error('Координатор авторизации завершил работу')
      );
    }

    return withAuthRefreshLock(async () => {
      if (disposed) {
        throw new Error('Координатор авторизации завершил работу');
      }

      return operation();
    });
  };

  /** Публикует сообщение о изменении сессии
   *
   * @param {Object} result
   * @returns {Object}
   */
  const publishSessionChanged = (result) => {
    const claims = getAccessTokenClaims(result?.token);

    if (!claims || claims.id !== result?.user?.id) {
      throw new Error('Не удалось определить новую серверную сессию');
    }

    channel.publish({
      type: AUTH_MESSAGE_TYPES.SESSION_CHANGED,
      senderId: tabId,
      userId: claims.id,
      sessionId: claims.sid,
    });

    return result;
  };

  /** Обновление refresh-сессии. */
  const refreshSession = () => runLocked(refreshAuth);

  /** Завершает серверную сессию и уведомляет другие вкладки. */
  const endSession = () => {
    const claims = getAccessTokenClaims(getToken());

    if (!claims) {
      return Promise.reject(new Error('Не удалось определить текущую сессию'));
    }

    return runLocked(async () => {
      await logoutUser(claims.sid);

      try {
        channel.publish({
          type: AUTH_MESSAGE_TYPES.SESSION_LOGOUT,
          senderId: tabId,
          userId: claims.id,
          sessionId: claims.sid,
        });
      } catch (error) {
        console.warn('Не удалось уведомить другие вкладки о выходе', error);
      }
    });
  };

  /** Авторизация пользователя. */
  const loginSession = (credentials) =>
    runLocked(async () => {
      const result = await loginUser(credentials);

      return publishSessionChanged(result);
    });

  /** Регистрация пользователя. */
  const registerSession = (formData) =>
    runLocked(async () => {
      const result = await registerUser(formData);

      return publishSessionChanged(result);
    });

  return {
    dispose,
    refreshSession,
    endSession,
    loginSession,
    registerSession,
  };
};
