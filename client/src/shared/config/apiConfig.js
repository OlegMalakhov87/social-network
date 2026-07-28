/** Базовый URL для REST API */
export const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/** Базовый URL для WebSocket */
export const WS_URL = (process.env.REACT_APP_WS_URL || API_URL)
  .replace(/^http/, 'ws')
  .replace(/\/api$/, '');
