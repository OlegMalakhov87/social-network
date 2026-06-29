/**
 * Сохраняет Redux Store для доступа к JWT внутри apiFetch.
 *
 * @param {import('@reduxjs/toolkit').EnhancedStore} store
 */
let _store = null;
export function setStoreForApiFetch(store) {
  _store = store;
}

/**
 * /**
 * Выполняет HTTP-запрос через Fetch API.
 * Автоматически добавляет Authorization Bearer Token, если пользователь авторизован.
 *
 * @param {string} url
 * @param {Object} options
 * @returns {Promise<Response>}
 */

export async function apiFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (_store) {
    const token = _store.getState().auth?.token;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch {
      /**Тело ответа отсутствует */
    }
    throw new Error(`Ошибка ${response.status}:${message}`);
  }
  return response;
}
