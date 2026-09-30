const Redis = require('ioredis');

/** Клиент Redis с автопереподключением. */
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: false,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('connect', () => {
  console.log('[Redis] Подключение установлено');
});

redis.on('error', (err) => {
  console.error('[Redis] Ошибка:', err.message);
});

module.exports = { redis };
