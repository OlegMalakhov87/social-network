const { randomUUID } = require('node:crypto');

const { redis } = require('../lib/redis');

/**
 * Захватывает распределённый лок в Redis.
 *
 * Атомарный SET NX EX: только один клиент получит лок, остальные — null.
 * Возвращает функцию release для корректного освобождения.
 *
 * @param {string} key - Имя ключа лока
 * @param {number} ttlSeconds - Время жизни лока в секундах
 * @returns {Promise<Function|null>} Функция release или null, если лок занят.
 */
const acquireLock = async (key, ttlSeconds) => {
  const value = randomUUID();

  const result = await redis.set(key, value, 'NX', 'EX', ttlSeconds);

  if (result !== 'OK') {
    return null;
  }

  /**
   * Освобождает лок, только если он всё ещё принадлежит нам.
   * Если TTL истёк и лок подхватил другой инстанс — не трогаем его.
   *
   * @returns {Promise<void>}
   */
  const release = async () => {
    // Lua-скрипт атомарно проверяет значение и удаляет.
    const script = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end
    `;

    try {
      await redis.eval(script, 1, key, value);
    } catch (error) {
      // Если Redis недоступен — не падаем, лок всё равно истечёт по TTL.
      console.error('[Lock] Ошибка освобождения лока:', error.message);
    }
  };

  return release;
};

module.exports = { acquireLock };
