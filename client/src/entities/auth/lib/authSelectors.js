/**
 * Возвращает текущего пользователя.
 *
 * @param {Object} state - Состояние Redux
 * @returns {Object|null} Текущий пользователь
 */
export const selectUser = (state) => state.auth.user;

/**
 * Возвращает маркер доступа.
 *
 * @param {Object} state - Состояние Redux
 * @returns {string|null} Маркер доступа
 */
export const selectToken = (state) => state.auth.token;

/**
 * Проверяет, авторизован ли пользователь.
 *
 * @param {Object} state - Состояние Redux
 * @returns {boolean} Признак авторизации
 */
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

/**
 * Возвращает статус запросов авторизации.
 *
 * Принимает значения idle, loading, succeeded и failed.
 *
 * @param {Object} state - Состояние Redux
 * @returns {string} Статус запросов
 */
export const selectAuthStatus = (state) => state.auth.status;

/**
 * Возвращает текст последней ошибки авторизации.
 *
 * @param {Object} state - Состояние Redux
 * @returns {string|null} Текст ошибки
 */
export const selectAuthError = (state) => state.auth.error;

/**
 * Проверяет, выполняется ли запрос авторизации.
 *
 * @param {Object} state - Состояние Redux
 * @returns {boolean} Признак выполнения запроса
 */
export const selectIsAuthLoading = (state) => state.auth.status === 'loading';

/**
 * Возвращает идентификатор текущего пользователя.
 *
 * @param {Object} state - Состояние Redux
 * @returns {number|null} Идентификатор пользователя
 */
export const selectUserId = (state) => state.auth.user?.id ?? null;

/**
 * Возвращает почту пользователя.
 *
 * @param {Object} state - Состояние Redux
 * @returns {string|null} Почта пользователя
 */
export const selectUserEmail = (state) => state.auth.user?.email ?? null;

/**
 * Возвращает имя пользователя.
 *
 * @param {Object} state - Состояние Redux
 * @returns {string|null} Имя пользователя
 */
export const selectUserName = (state) => state.auth.user?.name ?? null;

/**
 * Возвращает никнейм пользователя.
 *
 * @param {Object} state - Состояние Redux
 * @returns {string|null} Никнейм пользователя
 */
export const selectUserNickname = (state) => state.auth.user?.nickname ?? null;

/**
 * Возвращает аватар пользователя.
 *
 * @param {Object} state - Состояние Redux
 * @returns {string|null} Аватар пользователя
 */
export const selectUserAvatar = (state) => state.auth.user?.avatar ?? null;

/**
 * Проверяет, загружен ли пользователь.
 *
 * @param {Object} state - Состояние Redux
 * @returns {boolean} Признак загруженного пользователя
 */
export const selectHasUser = (state) => Boolean(state.auth.user);

/**
 * Проверяет наличие маркера доступа.
 *
 * @param {Object} state - Состояние Redux
 * @returns {boolean} Признак маркера доступа
 */
export const selectHasToken = (state) => Boolean(state.auth.token);

/**
 * Проверяет, завершена ли проверка авторизации.
 *
 * @param {Object} state - Состояние Redux
 * @returns {boolean} Признак завершённой проверки
 */
export const selectIsAuthReady = (state) => !state.auth.isCheckingAuth;

/**
 * Проверяет, что пользователь авторизован и проверка завершена.
 *
 * @param {Object} state - Состояние Redux
 * @returns {boolean} Признак готовой авторизации
 */
export const selectIsAuthenticatedAndReady = (state) =>
  Boolean(
    selectIsAuthenticated(state) &&
      selectIsAuthReady(state) &&
      selectHasUser(state)
  );
