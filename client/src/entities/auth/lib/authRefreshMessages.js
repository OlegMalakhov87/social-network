/**
 * Типы сообщений для обмена токенами между вкладками.
 */
export const AUTH_MESSAGE_TYPES = Object.freeze({
  TOKEN_REQUEST: 'TOKEN_REQUEST',
  TOKEN_RESPONSE: 'TOKEN_RESPONSE',
  TOKEN_UPDATED: 'TOKEN_UPDATED',
  SESSION_LOGOUT: 'SESSION_LOGOUT',
  SESSION_CHANGED: 'SESSION_CHANGED',
});
