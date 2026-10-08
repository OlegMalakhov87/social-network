const { z } = require('zod');

/**
 * Категории новостей
 * @type {Array<string>}
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
 * Схема для LLM
 * @type {z.ZodObject<{shouldPublish: z.ZodBoolean, title: z.ZodString, summary: z.ZodString, category: z.ZodEnum<NEWS_CATEGORIES>}>}
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
