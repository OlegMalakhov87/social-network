/**
 * Выполняет fetch с повторными попытками при временных сетевых ошибках.
 *
 * Повторяет запрос при:
 * - сетевых ошибках (EAI_AGAIN, ECONNRESET, ENOTFOUND, fetch failed)
 * - ответах 5xx
 *
 * Не повторяет при:
 * - 4xx (клиентская ошибка — повтор не поможет)
 * - AbortError (запрос отменён)
 *
 * @param {string} url - URL запроса
 * @param {Object} [options={}] - опции fetch
 * @param {Object} [retryConfig={}]
 * @param {number} [retryConfig.retries=3] - количество повторных попыток
 * @param {number} [retryConfig.delay=500] - начальная задержка в мс
 * @param {number} [retryConfig.maxDelay=5000] - максимальная задержка
 * @param {number} [retryConfig.backoff=2] - множитель экспоненциальной задержки
 * @returns {Promise<Response>}
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
