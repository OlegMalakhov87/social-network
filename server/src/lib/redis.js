const Redis = require('ioredis');

/** Подключает клиент Redis и повторяет соединение после сбоя. */
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: false,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000), // Увеличивает паузу повтора и ограничивает ее двумя секундами.
});

redis.on('connect', () => {
  console.log('[Redis] Подключение установлено');
});

redis.on('error', (err) => {
  console.error('[Redis] Ошибка:', err.message);
});

module.exports = { redis };
