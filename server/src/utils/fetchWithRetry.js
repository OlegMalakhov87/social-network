/**
 * Повторяет запрос fetch при временной сетевой ошибке и ответе 5xx.
 *
 * Повторяет запрос при ошибках EAI_AGAIN, ECONNRESET, ENOTFOUND и fetch failed, а также при ответах 5xx.
 * Не повторяет запрос при ответе 4xx и при отмене AbortError.
 *
 * @param {string} url - URL запроса
 * @param {Object} [options={}] - Параметры fetch
 * @param {Object} [retryConfig={}] - Параметры повтора
 * @param {number} [retryConfig.retries=3] - Число повторов
 * @param {number} [retryConfig.delay=500] - Начальная задержка в миллисекундах
 * @param {number} [retryConfig.maxDelay=5000] - Максимальная задержка в миллисекундах
 * @param {number} [retryConfig.backoff=2] - Множитель задержки
 * @returns {Promise<Response>} Ответ fetch.
 */
const fetchWithRetry = async (
  url,
  options = {},
  { retries = 3, delay = 500, maxDelay = 5000, backoff = 2 } = {}
) => {
  let lastError;
  let currentDelay = delay;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      if (response.ok) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }

      lastError = error;
    }

    if (attempt === retries) break;

    console.warn(
      `[fetchWithRetry] Попытка ${attempt + 1} не удалась. ` +
        `Повтор через ${currentDelay}мс. URL: ${url}`
    );

    await new Promise((resolve) => setTimeout(resolve, currentDelay));

    currentDelay = Math.min(currentDelay * backoff, maxDelay);
  }

  throw lastError || new Error('fetchWithRetry: все попытки провалились');
};

module.exports = { fetchWithRetry };
