const {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
  REFRESH_TOKEN_TTL_MS,
} = require('../../config/authConfig');

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: REFRESH_COOKIE_PATH,
});

const setRefreshCookie = (res, refreshToken, maxAge = REFRESH_TOKEN_TTL_MS) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...getRefreshCookieOptions(),
    maxAge,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
};

module.exports = {
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
  clearRefreshCookie,
};
