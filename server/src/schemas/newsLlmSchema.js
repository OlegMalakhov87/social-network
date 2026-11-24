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
 * HTML-валидация LLM-ответа.
 */
const NO_HTML = /^[^<>]*$/;

/**
 * Проверяет ответ модели: решение о публикации, заголовок, текст, категорию и причину.
 */
const newsLlmSchema = z.object({
  shouldPublish: z.boolean(),

  title: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(NO_HTML, 'HTML в заголовке не разрешён'),

  summary: z
    .string()
    .trim()
    .min(1)
    .max(5000)
    .regex(NO_HTML, 'HTML в тексте не разрешён'),

  category: z.enum(NEWS_CATEGORIES),

  reason: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .regex(NO_HTML, 'HTML в причине не разрешён'),
});

module.exports = {
  NEWS_CATEGORIES,
  newsLlmSchema,
};
