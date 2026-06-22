/** Сохраняем ссылку на Redux Store.
Это позволяет apiFetch получать токен без необходимости передавать store в каждую функцию API.
 * @param {Object} store
*/
let _store = null;
export function setStoreForApiFetch(store) {
  _store = store;
}

/**
 * Выполнить fetch с автоматической подстановкой токена.
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

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch {}
    throw new Error(`Ошибка ${response.status}:${message}`);
  }
  return response;
}
