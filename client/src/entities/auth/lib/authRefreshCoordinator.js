import {
  createAuthRefreshChannel,
  withAuthRefreshLock,
} from '../../../shared/lib';
import { getAccessTokenClaims } from './accessToken';
import { AUTH_MESSAGE_TYPES } from './authRefreshMessages';

/**
 * Создаёт координатор обмена сообщениями авторизации.
 *
 * @param {Object} options - Настройки координатора
 * @param {Function} options.getToken - Возвращает маркер доступа
 * @param {Function} options.refreshAuth - Обновляет маркер доступа
 * @param {Function} options.loginUser - Авторизует пользователя
 * @param {Function} options.registerUser - Регистрирует пользователя
 * @param {Function} options.logoutUser - Завершает сессию на сервере
 * @param {Function} [options.onSessionLogout] - Обработчик выхода из сессии
 * @param {Function} [options.onSessionChanged] - Обработчик смены сессии
 * @returns {Object} Методы координатора
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
   * Обрабатывает входящее сообщение другой вкладки.
   *
   * @param {Object} message - Сообщение авторизации
   * @returns {void}
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
  };

  const unsubscribe = channel.subscribe(handleMessage);

  /** Освобождает ресурсы координатора. */
  const dispose = () => {
    if (disposed) return;

    disposed = true;
    unsubscribe();
    channel.close();
  };

  /**
   * Выполняет операцию под общей блокировкой авторизации.
   *
   * @param {Function} operation - Операция авторизации
   * @returns {Promise<*>} Результат операции
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

  /**
   * Публикует изменение сессии для других вкладок.
   *
   * @param {Object} result - Результат входа
   * @returns {Object} Исходный результат
   */
  const publishSessionChanged = (result) => {
    const claims = getAccessTokenClaims(result?.token);

    if (!claims || claims.id !== result?.user?.id) {
      console.warn('Не удалось определить новую серверную сессию');

      return result;
    }

    try {
      channel.publish({
        type: AUTH_MESSAGE_TYPES.SESSION_CHANGED,
        senderId: tabId,
        userId: claims.id,
        sessionId: claims.sid,
      });
    } catch (error) {
      console.warn('Не удалось уведомить другие вкладки о смене сессии', error);
    }

    return result;
  };

  /** Обновляет сессию под общей блокировкой. */
  const refreshSession = () => runLocked(refreshAuth);

  /** Завершает сессию на сервере и уведомляет другие вкладки. */
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

  /**
   * Авторизует пользователя и сообщает о новой сессии.
   *
   * @param {Object} credentials - Почта и пароль
   * @returns {Promise<Object>} Результат входа
   */
  const loginSession = (credentials) =>
    runLocked(async () => {
      const result = await loginUser(credentials);

      return publishSessionChanged(result);
    });

  /**
   * Регистрирует пользователя и сообщает о новой сессии.
   *
   * @param {Object} formData - Данные нового пользователя
   * @returns {Promise<Object>} Результат регистрации
   */
  const registerSession = (formData) =>
    runLocked(async () => {
      const result = await registerUser(formData);

      return publishSessionChanged(result);
    });

  /**
   * Уведомляет другие вкладки об отзыве текущей сессии.
   *
   * Выход на сервере не выполняется: сессия уже недействительна.
   *
   * @param {string} token - Маркер доступа
   * @returns {void}
   */
  const notifySessionRevoked = (token) => {
    if (disposed || !token || getToken() !== token) {
      return;
    }

    const claims = getAccessTokenClaims(token);

    if (!claims) {
      return;
    }

    try {
      channel.publish({
        type: AUTH_MESSAGE_TYPES.SESSION_LOGOUT,
        senderId: tabId,
        userId: claims.id,
        sessionId: claims.sid,
      });
    } catch (error) {
      console.warn('Не удалось уведомить вкладки об отзыве сессии', error);
    }
  };

  return {
    dispose,
    refreshSession,
    endSession,
    loginSession,
    registerSession,
    notifySessionRevoked,
  };
};
