const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/auth';

module.exports = {
  REFRESH_TOKEN_TTL_MS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
};
