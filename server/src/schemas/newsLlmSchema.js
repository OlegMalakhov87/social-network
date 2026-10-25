const { z } = require('zod');

/**
 * Перечисляет допустимые категории новости.
 *
 * @type {string[]}
 */
const NEWS_CATEGORIES = [
  'technology',
  'sports',
  'culture',
  'economy',
  'health',
  'other',
];

/**
 * Проверяет ответ модели: решение о публикации, заголовок, текст, категорию и причину.
 */
const newsLlmSchema = z.object({
  shouldPublish: z.boolean(),

  title: z.string().trim().min(1).max(100),

  summary: z.string().trim().min(1).max(5000),

  category: z.enum(NEWS_CATEGORIES),

  reason: z.string().trim().min(1).max(300),
});

module.exports = {
  NEWS_CATEGORIES,
  newsLlmSchema,
};
