const {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
  REFRESH_TOKEN_TTL_MS,
} = require('../../config/authConfig');

/**
 * Получение опций для refresh токена.
 * @returns {Object} Опции для refresh токена.
 */
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: REFRESH_COOKIE_PATH,
});

/**
 * Установка refresh токена в cookie.
 * @param {Object} res - Объект response.
 * @param {string} refreshToken - Refresh токен.
 * @param {number} maxAge - Срок действия refresh токена.
 */
const setRefreshCookie = (res, refreshToken, maxAge = REFRESH_TOKEN_TTL_MS) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...getRefreshCookieOptions(),
    maxAge,
  });
};

/**
 * Очистка refresh токена из cookie.
 * @param {Object} res - Объект response.
 */
const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
};

module.exports = {
  setRefreshCookie,
  clearRefreshCookie,
};
