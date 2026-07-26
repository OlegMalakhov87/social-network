/**
 * Получить объект текущего пользователя.
 *
 * @param {Object} state - Redux Store.
 * @returns {Object|null}
 */
export const selectUser = (state) => state.auth.user;

/**
 * Получить JWT токен.
 *
 * @param {Object} state - Redux Store.
 * @returns {string|null}
 */
export const selectToken = (state) => state.auth.token;

/**
 * Проверить, авторизован ли пользователь.
 *
 * @param {Object} state - Redux Store.
 * @returns {boolean}
 */
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

/**
 * Получить статус запросов авторизации.
 *
 * idle | loading | succeeded | failed
 *
 * @param {Object} state - Redux Store.
 * @returns {string}
 */
export const selectAuthStatus = (state) => state.auth.status;

/**
 * Получить текст последней ошибки авторизации.
 *
 * @param {Object} state - Redux Store.
 * @returns {string|null}
 */
export const selectAuthError = (state) => state.auth.error;

/**
 * Проверить, выполняется ли запрос авторизации.
 *
 * @param {Object} state - Redux Store.
 * @returns {boolean}
 */
export const selectIsAuthLoading = (state) => state.auth.status === 'loading';

/**
 * Получить id текущего пользователя.
 *
 * @param {Object} state - Redux Store.
 * @returns {number|null}
 */
export const selectUserId = (state) => state.auth.user?.id ?? null;

/**
 * Получить email пользователя.
 *
 * @param {Object} state - Redux Store.
 * @returns {string}
 */
export const selectUserEmail = (state) => state.auth.user?.email ?? null;

/**
 * Получить имя пользователя.
 *
 * @param {Object} state - Redux Store.
 * @returns {string}
 */
export const selectUserName = (state) => state.auth.user?.name ?? null;

/**
 * Получить никнейм пользователя.
 *
 * @param {Object} state - Redux Store.
 * @returns {string}
 */
export const selectUserNickname = (state) => state.auth.user?.nickname ?? null;

/**
 * Получить фотографию пользователя.
 *
 * @param {Object} state - Redux Store.
 * @returns {string}
 */
export const selectUserPhoto = (state) => state.auth.user?.photoUrl ?? null;

/**
 * Проверить, загружен ли пользователь.
 *
 * @param {Object} state
 * @returns {boolean}
 */
export const selectHasUser = (state) => Boolean(state.auth.user);

/**
 * Проверить наличие JWT токена.
 *
 * @param {Object} state
 * @returns {boolean}
 */
export const selectHasToken = (state) => Boolean(state.auth.token);

/**
 * Проверить, завершена ли инициализация авторизации.
 *
 * @param {Object} state
 * @returns {boolean}
 */
export const selectIsAuthReady = (state) => state.auth.status !== 'loading';
