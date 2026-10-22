const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // срок действия refresh токена (7 дней)

const REFRESH_COOKIE_NAME = 'refreshToken'; // имя refresh токена
const REFRESH_COOKIE_PATH = '/api/auth'; // путь refresh токена

module.exports = {
  REFRESH_TOKEN_TTL_MS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
};
