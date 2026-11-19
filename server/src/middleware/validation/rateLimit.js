const rateLimit = require('express-rate-limit');

/**
 * Возвращает true, если приложение работает в тестовом режиме.
 * В тестах rate-limit отключён, чтобы не мешать другим тестам:
 * все запросы идут с 127.0.0.1, и лимит сработал бы после первых
 * нескольких тестов, ломая остальные.
 *
 * @returns {boolean} Признак тестового режима.
 */
const isTest = () => process.env.NODE_ENV === 'test';

/**
 * Создаёт rate-limit middleware с общими настройками.
 *
 * @param {Object} options - Настройки
 * @param {number} options.windowMs - Окно в миллисекундах
 * @param {number} options.max - Максимум запросов в окне
 * @param {string} options.message - Текст ошибки для клиента
 * @returns {Function} Express middleware.
 */
const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    // Возвращает заголовки RateLimit-* в ответе — клиент знает,
    // сколько попыток осталось и когда можно повторить.
    standardHeaders: true,
    // Отключает устаревшие X-RateLimit-* заголовки.
    legacyHeaders: false,
    // В тестах отключён — иначе лимит сломает остальные тесты.
    skip: isTest,
    message: {
      error: message,
      code: 'RATE_LIMIT_EXCEEDED',
    },
  });

// Логин: защита от брутфорса пароля.
// 10 попыток за 15 минут.
const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Слишком много попыток входа. Попробуйте через 15 минут.',
});

// Регистрация: защита от спам-создания аккаунтов.
// 5 попыток за час.
const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Слишком много попыток регистрации. Попробуйте через час.',
});

// Refresh: защита от циклов и DoS.
// Обычно refresh вызывается раз в 15 минут — 60 в минуту огромный запас.
const refreshLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Слишком много запросов обновления токена.',
});

module.exports = {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
};
