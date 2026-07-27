/**
 * Ключ хранения JWT в localStorage.
 * Используется только модулем авторизации.
 */
const TOKEN_KEY = 'revivo_token';

/**
 * Сохранить JWT токен.
 *
 * @param {string} token
 */
export const saveToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Получить JWT токен.
 *
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Удалить JWT токен.
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
