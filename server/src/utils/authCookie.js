const {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
  REFRESH_TOKEN_TTL_MS,
} = require('../../config/authConfig');

/**
 * Возвращает параметры cookie маркера обновления.
 *
 * @returns {{httpOnly: boolean, secure: boolean, sameSite: string, path: string}} Параметры cookie.
 */
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: REFRESH_COOKIE_PATH,
});

/**
 * Сохраняет маркер обновления в cookie ответа.
 *
 * @param {import('express').Response} res - Ответ Express
 * @param {string} refreshToken - Маркер обновления
 * @param {number} [maxAge=REFRESH_TOKEN_TTL_MS] - Срок действия cookie в миллисекундах
 * @returns {void} Ничего не возвращает.
 */
const setRefreshCookie = (res, refreshToken, maxAge = REFRESH_TOKEN_TTL_MS) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...getRefreshCookieOptions(),
    maxAge,
  });
};

/**
 * Удаляет маркер обновления из cookie ответа.
 *
 * @param {import('express').Response} res - Ответ Express
 * @returns {void} Ничего не возвращает.
 */
const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
};

module.exports = {
  setRefreshCookie,
  clearRefreshCookie,
};
